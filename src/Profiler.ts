type EventPeriods = {[name: string]: number};

export class Profiler {
  startTime: number = Math.floor(Date.now());
  lastStopTime: number = 0;
  events: EventPeriods = {};

  registerEvent(eventName: string): void {
    this.events[eventName] = Math.floor(Date.now());
  }

  getDuration(): number {
    return Math.floor(Date.now()) - this.startTime;
  }

  getOutput(): string {
    let sum:number = 0;
    let result = "";
    for (let name in this.events) {
      let duration: number = this.events[name] - this.startTime - sum;
      sum += duration;
      result += name + ": " + duration + "; ";
    }
    return result;
  }
}
