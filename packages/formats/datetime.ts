export { format as formatDate } from 'date-fns';

export const DATE_FORMATS = {
  1: 'do MMM, yyyy', // Day Month, Year
  2: 'MMMM do, yyyy', // Month Day, Year
  3: 'yyyy-MM-dd', // YYYY-MM-DD
  4: 'MM/dd/yyyy', // MM/DD/YYYY
  5: 'dd/MM/yyyy', // DD/MM/YYYY
  6: 'dd.MM.yyyy', // DD.MM.YYYY
};

export const TIME_FORMATS = {
  1: 'h:mm aaa', // H:mm pm
  2: 'h:mm aa', // H:mm PM
  3: 'HH:mm', // HH:mm
};
