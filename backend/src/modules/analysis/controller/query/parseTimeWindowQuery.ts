// analysis/controller/dto/AnalysisTimeWindowQuery.dto.ts
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';

export function parseTimeWindowQuery(query: any): IAnalysisTimeWindow | undefined {
    const { startAt, endAt } = query;

    if (!startAt && !endAt) return undefined;

    const window: IAnalysisTimeWindow = {
        startAt: undefined,
        endAt: undefined,
    };

    if (startAt) {
        const d = new Date(startAt);
        if (isNaN(d.getTime())) return undefined;
        window.startAt = d;
    }

    if (endAt) {
        const d = new Date(endAt);
        if (isNaN(d.getTime())) return undefined;
        window.endAt = d;
    }

    return window;
}
