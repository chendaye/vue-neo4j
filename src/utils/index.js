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
export const sortArray = (arr, key, order) => {
  if (order == "asc") {
    arr.sort((a, b) => a[key] - b[key]);
  } else if (order == "desc") {
    arr.sort((a, b) => b[key] - a[key]);
  }
  return arr;
}

export const parseWords = (data) => {
  let word = data.split("@");
  let arr = [];
  for (let i = 0; i < word.length; i++) {
    let keyword = word[i].split(":");
    if (keyword.length == 3) {
      arr.push({
        id: parseInt(keyword[0]),
        word: keyword[1],
        frequency: parseInt(keyword[2])
      });
    }
  }
  return arr;
}