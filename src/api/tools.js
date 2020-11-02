export function drawExpend(queryData) {
    let xAxisData = [];
    const seriesData = [];
    let xDateList = [];
    let wechatAmountData = [];
    let zfbAmontData = [];
    let cachAmontData = [];
    queryData.forEach((item) => {
      const formatDate = moment(item.createDate).format("YYYY-MM-DD");
      item.formatDate = formatDate;
      xDateList.push(formatDate);
    });
    xAxisData = [...new Set(xDateList)].sort();
    xAxisData.forEach((item, index) => {
        zfbAmontData[index] = 0 ;
        wechatAmountData[index] = 0;
        cachAmontData[index] = 0;
      this.echartsData.forEach((item2) => {
        if (item == item2.formatDate) {
          if (item2.payMethods == '支付宝') {
            zfbAmontData[index] = zfbAmontData[index] + item2.amount ;
            wechatAmountData[index] = 0 + wechatAmountData[index];
            cachAmontData[index] = 0 + cachAmontData[index];
          } else if (item2.payMethods == '微信') {
            wechatAmountData[index] = wechatAmountData[index] + item2.amount;
            zfbAmontData[index] = zfbAmontData[index] + 0;
            cachAmontData[index] = cachAmontData[index] + 0;
          } else {
            cachAmontData[index] = cachAmontData[index] + item2.amount;
            zfbAmontData[index] = zfbAmontData[index] + 0;
            wechatAmountData[index] = wechatAmountData[index] + 0;
          }
        }
      });
    });
    this.drawLine(xAxisData, wechatAmountData, zfbAmontData, cachAmontData);
  }