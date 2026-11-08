// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───

export class WriteQueue {
  private chain: Promise<unknown> = Promise.resolve();
  private pending = 0;

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    this.pending += 1;
    const next = this.chain.then(task, task).finally(() => {
      this.pending -= 1;
    });
    // Keep the internal chain alive even if an individual write rejects
    this.chain = next.catch(() => undefined);
    return next;
  }

  get pendingCount(): number {
    return this.pending;
  }

  async flush(): Promise<void> {
    await this.chain;
  }
}

export const defaultWriteQueue = new WriteQueue();

export function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  return defaultWriteQueue.enqueue(task);
}

export function flushWriteQueue(): Promise<void> {
  return defaultWriteQueue.flush();
}
