(() => {
  /**
   * 画面ロードイベントハンドラ
   */
  document.addEventListener("DOMContentLoaded", () => {
    setValuesFromLocalStorage();
  });

  /**
   * ファイル選択イベントハンドラ
   */
  document.getElementById("selected_file").addEventListener(
    "change",
    (event) => {
      const file = event.target.files;
      const reader = new FileReader();
      reader.readAsText(file[0]);
      reader.onload = () => {
        // ファイルから取得した値をローカルストレージに保存
        setValueFromFile(reader.result);
        // ローカルストレージの値を一括でテキストに設定
        setValuesFromLocalStorage();
      };
    },
    false
  );
})();

/** APIキー */
const API_KEY = "";

/**
 * テーブルに値を設定
 */
const setTable = async () => {
  const result = await requestAPI("https://swapi.dev/api/people", "GET");
  createTable(result.results);
};

/**
 * テーブルを作成
 * @param {*} data APIから取得したデータ
 */
const createTable = (data) => {
  // テーブル生成
  const table = document.createElement("table");
  table.setAttribute("border", "1");

  const tr = document.createElement("tr");
  // ヘッダー
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key;
    tr.appendChild(th);
  });

  // ボタン用のテーブルヘッダーを追加
  const thButton = document.createElement("th");
  tr.appendChild(thButton);
  table.appendChild(tr);

  // ボディ
  data.forEach((row) => {
    const tr = document.createElement("tr");

    // APIから取得した値を設定
    Object.keys(data[0]).forEach((key) => {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });

    // ボタンを追加
    const td = document.createElement("td");
    const button = document.createElement("button");
    button.textContent = "取得";
    button.addEventListener(
      "click",
      () => {
        alert(row[0]);
      },
      false
    );
    td.appendChild(button);

    tr.appendChild(td);
    table.appendChild(tr);
  });

  // 生成したテーブルに追加
  const mainTable = document.getElementById("main_table");
  mainTable.innerHTML = "";
  mainTable.appendChild(table);
};

/**
 * 新しいボックスを追加
 */
const addBox = () => {
  const elements = document.getElementById("input_box");
  const copied = elements.lastElementChild.cloneNode(true);
  let i = elements.childElementCount + 1;
  copied.childNodes.forEach((node) => {
    if (node.id) {
      if (node.id.indexOf("url_text_") !== -1) {
        console.log;
        node.id = "url_text_" + i;
      } else if (node.id.indexOf("output_") !== -1) {
        node.id = "output_" + i;
      } else {
        node.id = i;
      }
      if (node.value) {
        // URLの値を削除
        node.value = "";
      }
    }
  });
  elements.appendChild(copied);
};

/**
 * APIリクエスト
 * @param {*} url URL
 * @param {*} type GET,POST等のタイプ
 * @param {*} data リクエストボディ
 * @returns
 */
const requestAPI = async (url, type, data = {}) => {
  const body = ["POST", "PUT"].includes(type) ? JSON.stringify(data) : null;
  console.time("API" + url);
  const response = await fetch(url, {
    method: type,
    headers: {
      "Content-Type": "application/json",
      // "X-API-KEY": API_KEY,
    },
    body,
  });
  console.timeEnd("API" + url);
  return response.json();
};

/**
 * ローカルストレージに値を保存
 */
const saveLocalStorage = () => {
  const elements = document.getElementById("input_box");
  for (let i = 0; i < elements.childElementCount; i++) {
    console.log(`url_text_${i + 1}`);
    const key = `url_text_${i + 1}`;
    localStorage.setItem(key, document.getElementById(key).value);
  }
  localStorage.setItem("total_count", elements.childElementCount.toString());
};

/**
 * ローカルストレージの値からファイルを作成
 */
const createFileFromLocalStorage = () => {
  const outArray = [];
  const elements = document.getElementById("input_box");
  for (let i = 0; i < elements.childElementCount; i++) {
    const key = `url_text_${i + 1}`;
    outArray.push([key, localStorage.getItem(key)]);
  }
  const outObject = Object.fromEntries(outArray);
  const outText = JSON.stringify(outObject);
  // ファイル作成
  createFile(outText);
};

/**
 * ファイルから取得した値をローカルストレージに保存
 * @param {*} text 文字列
 */
const setValueFromFile = (text) => {
  const object = JSON.parse(text);
  Object.keys(object).forEach((key) => {
    localStorage.setItem(key, object[key]);
  });
};

/**
 * ローカルストレージの値を一括でテキストに設定
 */
const setValuesFromLocalStorage = () => {
  const totalCount = localStorage.getItem("total_count");
  if (totalCount) {
    for (let i = 0; i < Number(totalCount); i++) {
      const key = `url_text_${i + 1}`;
      if (!document.getElementById(key)) {
        addBox();
      }
      document.getElementById(key).value = localStorage.getItem(key);
    }
  }
};

/**
 * 対象のイベントが持っているID情報を元にurlを取得してAPIアクセス
 * @param {*} event イベント
 */
const getAPI = async (event) => {
  event = event || window.event;
  const elem = event.target || event.srcElement;
  const elemId = elem.id;
  const url = document.getElementById("url_text_" + elemId).value;
  const methodType =
    document.getElementById("method_type_text_" + elemId).value || "GET";
  const result = await requestAPI(url, methodType);
  let json = JSON.stringify(result, null, "\t");
  const textElement = document.getElementById("output_" + elemId);
  textElement.innerHTML = json;
};

/**
 * ファイル作成
 * @param {*} text 文字列
 * @returns
 */
const createFile = (text) => {
  if (text.length < 1) {
    alert("保存するデータがありません");
    return;
  }
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `storage_${(+new Date()).toString()}.json`;
  link.click();
};
