export const getMonthRange = (month?: string): { month: string; startDate: Date; endDate: Date } => {
    const monthPattern = /^\d{4}-\d{2}$/;

    if (!month || !monthPattern.test(month)) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
        ).padStart(2, "0")}`;

        return getMonthRange(currentMonth);
    }

    const [year, monthIndex] = month.split("-").map(Number);

    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1));
    const endDate = new Date(Date.UTC(year, monthIndex, 1));

    return {
        month,
        startDate,
        endDate,
    };
};
export const getPreviousMonth = (month: string): string => {
    const monthPattern = /^\d{4}-\d{2}$/;

    if (!monthPattern.test(month)) {
        return getPreviousMonth(getMonthRange(month).month);
    }

    const [year, monthIndex] = month.split("-").map(Number);

    // Ay indeksini 2 eksilterek bir önceki aya güvenle geçiyoruz
    const previousMonthDate = new Date(Date.UTC(year, monthIndex - 2, 1));

    return `${previousMonthDate.getUTCFullYear()}-${String(
        previousMonthDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
};