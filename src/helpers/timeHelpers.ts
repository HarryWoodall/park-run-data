export function convertToSeconds(time: string) {
  const tokens = time.split(":"); // split it at the colons
  // minutes are worth 60 seconds. Hours are worth 60 minutes.

  let seconds = 0;
  const map = [1, 60, 60 * 60];
  for (let i = tokens.length - 1; i >= 0; i--) {
    seconds += parseInt(tokens[i]) * map[tokens.length - 1 - i];
  }

  return seconds;
}

export function formatTime(duration: number) {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

export function getTimeStamp() {
  const dateHelper = dateHelperFactory();
  const vals = `yyyy,mm,dd,hh,mmi,ss,mms`.split(`,`);
  const myDate = dateHelper(new Date()).toArr(...vals);
  return `${myDate.slice(0, 3).join(`/`)} ${myDate.slice(3, 6).join(`:`)}.${myDate.slice(-1)[0]}`;
}

type DateValues = {
  yyyy: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
  ms: number;
};

function dateHelperFactory() {
  const padZero = (val: number, len = 2) => `${val}`.padStart(len, `0`);
  const setValues = (date: Date) => {
    let vals: DateValues = {
      yyyy: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      mi: date.getMinutes(),
      s: date.getSeconds(),
      ms: date.getMilliseconds(),
    };
    Object.keys(vals)
      .filter((k) => k !== `yyyy`)
      // @ts-ignore
      .forEach((k) => (vals[k[0] + k] = padZero(vals[k], (k === `ms` && 3) || 2)));
    return vals;
  };

  return (date: Date) => ({
    values: setValues(date),
    toArr(...items: string[]) {
      // @ts-ignore
      return items.map((i) => this.values[i]);
    },
  });
}
