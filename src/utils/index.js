export const copyArray = (array, start, end) => {
  let length = array.length;
  if (!length) return [];
  end = end > length ? length : end;
  let data = [];
  for (let i = start; i < end; i++) {
    data.push(array[i]);
  }
  return data;
}
export const implode = (arr, tag) => {
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    str += arr[i];
    if (i < arr.length - 1) {
      str += tag;
    }
  }
  return str;
}