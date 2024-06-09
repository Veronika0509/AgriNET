import {createWxetChart} from "../createWxetChart";

export const updateWxetChart = (data: any, root: any, isMobile: boolean, additionalChartData: any): void => {
  createWxetChart(data, root, isMobile, additionalChartData);
};