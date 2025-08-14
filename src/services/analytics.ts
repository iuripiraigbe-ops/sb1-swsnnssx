import type { AnalyticsEvent } from '../types/legaltok';

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  track(event: string, data?: Partial<AnalyticsEvent>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    this.events.push(analyticsEvent);
    
    // In real app, would send to analytics service
    console.log('📊 Analytics Event:', analyticsEvent);
    
    // Simulate sending to external service
    this.sendToService(analyticsEvent);
  }

  private async sendToService(event: AnalyticsEvent) {
    // Mock implementation
    try {
      // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
    } catch (error) {
      console.warn('Analytics service unavailable:', error);
    }
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new AnalyticsService();