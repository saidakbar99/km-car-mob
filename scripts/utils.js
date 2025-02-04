import dayjs from "dayjs";

export const formatDate = (date, format = "DD MMM YYYY, HH:mm") =>
  dayjs(date).format(format);

export const formatISODate = (date = new Date()) => dayjs(date).format("YYYY-MM-DDTHH:mm:ss");