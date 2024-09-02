```JavaScript
// 安装
npm i @kotron/watcher -S

// 引用
import { DataProxy, addWatch } from '@kotron/watcher';

// 创建数据代理
const data = DataProxy.use({
    dev: false,
    name: 'demo'
});

// 添加监听
const removeWatch = addWatch(data, 'dev', record => {
    console.log(`old value: ${record.oldValue}`);
    console.log(`value: ${record.value}`);
});

data.dev = true;
// old value: false
// value: true

// 移除监听
removeWatch();
```
