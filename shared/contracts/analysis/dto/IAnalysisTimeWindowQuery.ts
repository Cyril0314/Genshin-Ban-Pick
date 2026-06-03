import type { IAnalysisTimeWindow } from '../IAnalysisTimeWindow';

export interface IAnalysisTimeWindowQuery {
    startAt?: string;
    endAt?: string;
}

export function toAnalysisTimeWindowQuery(timeWindow: IAnalysisTimeWindow): IAnalysisTimeWindowQuery {
    const query: IAnalysisTimeWindowQuery = {};
    if (timeWindow.startAt) {
        query.startAt = timeWindow.startAt.toISOString();
    }
    if (timeWindow.endAt) {
        query.endAt = timeWindow.endAt.toISOString();
    }
    return query;
}
