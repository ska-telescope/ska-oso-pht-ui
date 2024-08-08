export const mailto = (toEmail: string, subject: string, body: string) => {
  window.location.href = 'mailto:' + toEmail + '?subject=' + subject + '&body=' + body;
};
