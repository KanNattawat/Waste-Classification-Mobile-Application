const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH-u-ca-gregory", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  export default formatDate