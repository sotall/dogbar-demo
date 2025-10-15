class AuditLogger {
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    this.supabase =
      window.supabaseClient ||
      window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
    this.queue = [];
    this.isFlushing = false;
    this.retentionDays = 30;
    this.trimInProgress = false;
  }

  async log(action, details = {}) {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      const email = session?.user?.email || "unknown";
      const payload = {
        action,
        actor_email: email,
        details,
        occurred_at: new Date().toISOString(),
      };

      this.queue.push(payload);
      if (!this.isFlushing) {
        this.flushQueue();
      }
    } catch (error) {
      console.warn("❌ Failed to enqueue audit log:", error);
    }
  }

  async flushQueue() {
    if (this.queue.length === 0) return;
    this.isFlushing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 5);
      try {
        const { error } = await this.supabase.from("audit_logs").insert(batch);
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("❌ Failed to flush audit logs:", error);
        this.queue = batch.concat(this.queue);
        break;
      }
    }

    this.isFlushing = false;
    this.scheduleTrim();
  }

  scheduleTrim() {
    if (this.trimInProgress) return;
    this.trimInProgress = true;
    setTimeout(() => this.trimOldLogs(), 2000);
  }

  async trimOldLogs() {
    try {
      const cutoff = new Date(
        Date.now() - this.retentionDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await this.supabase
        .from("audit_logs")
        .delete()
        .lt("occurred_at", cutoff);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn("⚠️ Failed to trim old audit logs:", error);
    } finally {
      this.trimInProgress = false;
    }
  }
}

window.auditLogger = new AuditLogger();
