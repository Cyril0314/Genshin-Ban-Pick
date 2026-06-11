import type { ITimeWindow } from '../ITimeWindow';

export interface ITimeWindowQuery {
    startAt?: string;
    endAt?: string;
}

export function toTimeWindowQuery(timeWindow: ITimeWindow): ITimeWindowQuery {
    const query: ITimeWindowQuery = {};
    if (timeWindow.startAt) {
        query.startAt = timeWindow.startAt.toISOString();
    }
    if (timeWindow.endAt) {
        query.endAt = timeWindow.endAt.toISOString();
    }
    return query;
}

export function fromTimeWindowQuery(query: { startAt?: unknown, endAt?: unknown }): ITimeWindow | undefined {
    if (!query.startAt && !query.endAt) return undefined;

    const window: ITimeWindow = {
        startAt: undefined,
        endAt: undefined,
    };

    if (query.startAt) {
        const d = new Date(String(query.startAt));
        if (isNaN(d.getTime())) return undefined;
        window.startAt = d;
    }

    if (query.endAt) {
        const d = new Date(String(query.endAt));
        if (isNaN(d.getTime())) return undefined;
        window.endAt = d;
    }

    return window;
}
