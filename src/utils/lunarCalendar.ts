/**
 * 农历数据表 (1900-2100)
 * 每个元素为一个十六进制数，编码规则：
 * - 第0-3位：闰月月份（0表示无闰月）
 * - 第4-15位：每月大小月标志（1=30天，0=29天），从1月到12月
 * - 第16位：闰月大小月标志（1=30天，0=29天）
 * - 第17-20位：春节对应的公历月份和日期编码
 */
const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0, // 2050-2059
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520, // 2100
];

/**
 * 春节（农历正月初一）对应的公历日期
 * 格式：[月, 日]，从1900年开始
 */
const springFestival = [
  [1,31],[2,19],[2,8],[1,29],[2,16],[2,4],[1,25],[2,13],[2,2],[1,22], // 1900-1909
  [2,10],[1,30],[2,18],[2,6],[1,26],[2,14],[2,3],[1,23],[2,11],[2,1], // 1910-1919
  [2,20],[2,8],[1,28],[2,16],[2,5],[1,24],[2,13],[2,2],[1,23],[2,10], // 1920-1929
  [1,30],[2,17],[2,6],[1,26],[2,14],[2,4],[1,24],[2,11],[1,31],[2,19], // 1930-1939
  [2,8],[1,27],[2,15],[2,5],[1,25],[2,13],[2,2],[1,22],[2,10],[1,29], // 1940-1949
  [2,17],[2,6],[1,27],[2,14],[2,3],[1,24],[2,12],[1,31],[2,18],[2,8], // 1950-1959
  [1,28],[2,15],[2,5],[1,25],[2,13],[2,2],[1,21],[2,9],[1,30],[2,17], // 1960-1969
  [2,6],[1,27],[2,15],[2,3],[1,23],[2,11],[1,31],[2,18],[2,7],[1,28], // 1970-1979
  [2,16],[2,5],[1,25],[2,13],[2,2],[2,20],[2,9],[1,29],[2,17],[2,6], // 1980-1989
  [1,27],[2,15],[2,4],[1,23],[2,10],[1,31],[2,19],[2,7],[1,28],[2,16], // 1990-1999
  [2,5],[1,24],[2,12],[2,1],[1,22],[2,9],[1,29],[2,18],[2,7],[1,26], // 2000-2009
  [2,14],[2,3],[1,23],[2,10],[1,31],[2,19],[2,8],[1,28],[2,16],[2,5], // 2010-2019
  [1,25],[2,12],[2,1],[1,22],[2,10],[1,29],[2,17],[2,6],[1,26],[2,13], // 2020-2029
  [2,3],[1,23],[2,11],[1,31],[2,19],[2,8],[1,28],[2,15],[2,4],[1,24], // 2030-2039
  [2,12],[2,1],[1,22],[2,10],[1,30],[2,17],[2,6],[1,26],[2,14],[2,2], // 2040-2049
  [1,23],[2,11],[2,1],[1,22],[2,9],[1,28],[2,16],[2,5],[1,26],[2,13], // 2050-2059
  [2,2],[1,21],[2,9],[1,29],[2,17],[2,6],[1,27],[2,14],[2,3],[1,23], // 2060-2069
  [2,11],[1,31],[2,19],[2,7],[1,28],[2,15],[2,5],[1,25],[2,12],[2,1], // 2070-2079
  [1,22],[2,9],[1,29],[2,17],[2,6],[1,26],[2,14],[2,3],[1,24],[2,10], // 2080-2089
  [1,30],[2,18],[2,7],[1,27],[2,15],[2,5],[1,25],[2,12],[2,1],[1,22], // 2090-2099
  [2,9], // 2100
];

/** 获取某年闰月月份，0表示无闰月 */
function leapMonthOfYear(year: number): number {
  return lunarInfo[year - 1900] & 0xf;
}

/** 获取某年闰月天数，0表示无闰月 */
function leapDaysOfYear(year: number): number {
  if (leapMonthOfYear(year) === 0) return 0;
  return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
}

/** 获取某年某月（非闰月）的天数 */
function monthDays(year: number, month: number): number {
  return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

/**
 * 农历转公历
 * 通过春节日期作为锚点，累加天数偏移得到公历日期
 */
export function lunarToGregorian(
  lunarYear: number, lunarMonth: number, lunarDay: number, isLeap: boolean = false
): Date {
  if (lunarYear < 1900 || lunarYear > 2100) {
    return new Date();
  }

  const sf = springFestival[lunarYear - 1900];
  // 春节 = 农历正月初一对应的公历日期
  const springDate = new Date(lunarYear, sf[0] - 1, sf[1]);

  // 从正月初一开始累加天数
  let offset = 0;
  const leap = leapMonthOfYear(lunarYear);

  for (let m = 1; m < lunarMonth; m++) {
    offset += monthDays(lunarYear, m);
    // 如果该月后面有闰月，也要加上
    if (m === leap) {
      offset += leapDaysOfYear(lunarYear);
    }
  }

  // 如果当前选的是闰月，还要加上该月正常月的天数
  if (isLeap && lunarMonth === leap) {
    offset += monthDays(lunarYear, lunarMonth);
  }

  // 加上日期偏移（初一=0天偏移）
  offset += lunarDay - 1;

  const result = new Date(springDate);
  result.setDate(result.getDate() + offset);
  return result;
}

/**
 * 公历转农历
 * 计算公历日期距离当年春节的天数偏移，逐月扣减得到农历月日
 */
export function gregorianToLunar(date: Date): {
  month: number; day: number; year: number; isLeapMonth: boolean;
} {
  const year = date.getFullYear();

  // 先确定农历年份：如果公历日期在当年春节之前，则农历年为上一年
  let lunarYear = year;
  const sf = springFestival[lunarYear - 1900];
  if (!sf) {
    return { month: 1, day: 1, year, isLeapMonth: false };
  }
  const springDate = new Date(year, sf[0] - 1, sf[1]);

  if (date < springDate) {
    lunarYear = year - 1;
  }

  const sf2 = springFestival[lunarYear - 1900];
  if (!sf2) {
    return { month: 1, day: 1, year, isLeapMonth: false };
  }
  const springDate2 = new Date(lunarYear, sf2[0] - 1, sf2[1]);

  // 计算距离春节的天数
  let offset = Math.round((date.getTime() - springDate2.getTime()) / 86400000);

  const leap = leapMonthOfYear(lunarYear);
  let lunarMonth = 1;
  let isLeapMonth = false;
  let passedLeap = false;

  // 逐月扣减
  for (let m = 1; m <= 12; m++) {
    const days = monthDays(lunarYear, m);
    if (offset < days) {
      lunarMonth = m;
      break;
    }
    offset -= days;

    // 闰月处理
    if (m === leap && !passedLeap) {
      const leapDays = leapDaysOfYear(lunarYear);
      if (offset < leapDays) {
        lunarMonth = m;
        isLeapMonth = true;
        break;
      }
      offset -= leapDays;
      passedLeap = true;
    }

    lunarMonth = m + 1;
  }

  return {
    month: lunarMonth,
    day: offset + 1,
    year: lunarYear,
    isLeapMonth,
  };
}

/** 获取公历日期对应的农历信息（含中文显示） */
export function getLunarCalendarInfo(date: Date) {
  const lunar = gregorianToLunar(date);

  const lunarMonthsStr = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const lunarDaysStr = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
  ];

  const monthStr = lunar.isLeapMonth
    ? `闰${lunarMonthsStr[lunar.month - 1]}月`
    : `${lunarMonthsStr[lunar.month - 1]}月`;
  const dayStr = lunarDaysStr[lunar.day - 1] || '';

  return {
    month: lunar.month,
    day: lunar.day,
    year: lunar.year,
    isLeapMonth: lunar.isLeapMonth,
    monthStr,
    dayStr,
    fullStr: `${monthStr}${dayStr}`,
  };
}

/** 获取某年的闰月信息（返回闰月的月份，0表示无闰月） */
export function getLeapMonth(year: number): number {
  if (year < 1900 || year > 2100) return 0;
  return leapMonthOfYear(year);
}

/** 获取某农历年某月的天数 */
export function getLunarMonthDays(year: number, month: number, isLeap: boolean = false): number {
  if (year < 1900 || year > 2100) return 30;
  if (isLeap) {
    return leapDaysOfYear(year);
  }
  return monthDays(year, month);
}

/** 获取某年的所有月份（包括闰月） */
export function getLunarMonthsOfYear(year: number): Array<{ value: number; label: string; isLeap: boolean }> {
  const lunarMonthsStr = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const months: Array<{ value: number; label: string; isLeap: boolean }> = [];
  const leap = getLeapMonth(year);

  for (let i = 1; i <= 12; i++) {
    months.push({ value: i, label: lunarMonthsStr[i - 1], isLeap: false });
    if (i === leap) {
      months.push({ value: i, label: `闰${lunarMonthsStr[i - 1]}`, isLeap: true });
    }
  }

  return months;
}
