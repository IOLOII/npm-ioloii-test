// 坐标系转换
// 数组按照指定长度切片
function sliceArray(arr, len) {
  var a_len = arr.length;
  var result = [];
  for (var i = 0; i < a_len; i += len) {
    result.push(arr.slice(i, i + len));
  }
  return result;
}
// test sliceArray
// var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// console.log(sliceArray(a, 3));
// [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]

function lnglatConvert(Amap, lnglatsArr) {
  return new Promise((resolve, reject) => {
    AMap.convertFrom(
      sliceArray(lnglatsArr, 40),
      "gps",
      function (status, result) {
        if (result.info === "ok") {
          var lnglats = result.locations; // Array.<LngLat>
          resolve(lnglats);
        } else {
          reject(status);
        }
      }
    );
  });
}

export { lnglatConvert };