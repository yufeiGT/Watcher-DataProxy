### @kotron/watcher

> 对象观察者

-   进行观察监听
-   保护对象
-   设置对象只读
-   获取对象数据记录

#### 安装

```
npm i @kotron/watcher -S
```

#### 数据代理

```TypeScript
import { DataProxy } from '@kotron/watcher';

const options = {
    name: '演示项目',
    version: '0.1.0',
    tags: ['0.0.1', '0.0.5', '0.1.0'],
    author: {
        name: 'GT',
        email: '769416198@qq.com'
    }
};

// 创建数据代理
const data = DataProxy(options)
```

#### 数据观察

```TypeScript
import { watchProxy, addWatch } from '@kotron/watcher';

// 观察代理对象
watchProxy(data, (record) => {
    console.log('watchProxy', record)
}, {
    // 顶层代理对象需要添加深观察才能生效
    deep: true
});

// 观察属性
addWatch(data, 'name', (record) => {
    console.log('name', record);
}, {
    // 立即触发
    immediate: true
});
// name输出
name, {
    timestamp: 1725267320385,
    type: 'Add',
    path: ['name'],
    key: 'name',
    isNew: false,
    hasChange: false,
    originValue: '演示项目',
    oldValue: null,
    value: '演示项目',
    bubble: null
}

// 深观察tags数组
addWatch(data, 'tags', (record) => {
    console.log('tags', record);
}, {
    // 深观察
    deep: true
});

/**
 * 监听多个属性
 * removeWatch为可移除观察的函数
 */
const removeWatch = addWatch(data, ['version', 'author'], (records, trigger) => {
    console.log('version & author', records, trigger);
});

data.name = '演示项目2';
// name输出
name, {
    timestamp: 1725267320385,
    type: 'Update',
    path: ['name'],
    key: 'name',
    isNew: false,
    hasChange: true,
    originValue: '演示项目',
    oldValue: '演示项目',
    value: '演示项目2',
    bubble: null
}
// watchProxy输出
watchProxy, {
    timestamp: 1725267320385,
    type: 'Update',
    path: [],
    key: null,
    isNew: false,
    hasChange: true,
    originValue: {
        name: '演示项目',
        version: '0.1.0',
        tags: ['0.0.1', '0.0.5', '0.1.0'],
        author: {
            name: 'GT',
            email: '769416198@qq.com'
        }
    },
    oldValue: {
        name: '演示项目',
        version: '0.1.0',
        tags: ['0.0.1', '0.0.5', '0.1.0'],
        author: {
            name: 'GT',
            email: '769416198@qq.com'
        }
    },
    value: {
        name: '演示项目2',
        version: '0.1.0',
        tags: ['0.0.1', '0.0.5', '0.1.0'],
        author: {
            name: 'GT',
            email: '769416198@qq.com'
        }
    },
    bubble: {
        timestamp: 1725267320385,
        type: 'Update',
        path: ['name'],
        key: 'name',
        isNew: false,
        hasChange: true,
        originValue: '演示项目',
        oldValue: '演示项目',
        value: '演示项目2',
        bubble: null
    }
}

data.tags.push('0.1.1');
// tags输出
{
    timestamp: 1725267320385,
    type: 'Update',
    path: ['tags'],
    key: 'tags',
    isNew: false,
    hasChange: true,
    originValue: ['0.0.1', '0.0.5', '0.1.0'],
    oldValue: ['0.0.1', '0.0.5', '0.1.0'],
    value: ['0.0.1', '0.0.5', '0.1.0', '0.1.1'],
    bubble: null
}
// watchProxy输出，省略
...

data.version = '0.1.1';
// version & author 输出
version & author, [{
    timestamp: 1725267320385,
    type: 'Update',
    path: ['version'],
    key: 'version',
    isNew: false,
    hasChange: true,
    originValue: '0.1.0',
    oldValue: '0.1.0',
    value: '0.1.1',
    bubble: null
}, {
    timestamp: 1725267320385,
    type: 'Add',
    path: ['author'],
    key: 'author',
    isNew: false,
    hasChange: false,
    originValue: {
        name: 'GT',
        email: '769416198@qq.com'
    },
    oldValue: null,
    value: {
        name: 'GT',
        email: '769416198@qq.com'
    },
    bubble: null
}], {
    timestamp: 1725267320385,
    type: 'Update',
    path: ['version'],
    key: 'version',
    isNew: false,
    hasChange: true,
    originValue: '0.1.0',
    oldValue: '0.1.0',
    value: '0.1.1',
    bubble: null
}
// watchProxy输出，省略
...

// 移除观察
removeWatch();
```

#### 数据获取

```TypeScript
import { getTarget, getOriginValue, getDataRecord } from '@kotron/watcher';

// 获取原始对象
console.log(getTarget(data));
// 输出
{
    name: '演示项目2',
    version: '0.1.1',
    tags: ['0.0.1', '0.0.5', '0.1.0', '0.1.1'],
    author: {
        name: 'GT',
        email: '769416198@qq.com'
    }
}

// 获取tags原始值
console.log(getOriginValue(data.tags));
// 输出
['0.0.1', '0.0.5', '0.1.0'];

// 获取name数据记录
console.log(getDataRecord(data, 'name'));
// 输出
{
    timestamp: 1725267320385,
    type: 'Update',
    path: ['name'],
    key: 'name',
    isNew: false,
    hasChange: true,
    originValue: '演示项目',
    oldValue: '演示项目',
    value: '演示项目2',
    bubble: null
}
```

#### 保护&只读

```TypeScript
import { protect, readonly } from '@kotron/watcher';

/**
 * 保护author属性
 * setter为赋值钩子
 */
const setter = protect(data.author);
data.author.name = 'GTX';
// Assignment to protection variable 'name'
setter((target) => {
    target.name = 'GTX';
});
// GTX

// 设置name属性为只读状态
readonly(data, 'name');
data.name = '演示项目';
// Assignment to readonly variable 'name'
```

#### 判断

```TypeScript
import { isProxy, isProtected, isReadonly } from '@kotron/watcher';

// tags是否为代理对象
console.log(isProxy(data.tags));
// true

// name是否受保护
console.log(isProtected(data.author, 'name'));
// true

// name是否为只读状态
console.log(isReadonly(data, 'name'));
// true
```

#### 文档

| 函数名                  | 说明                               |
| :---------------------- | :--------------------------------- |
| DataProxy               | 为目标数据创建代理对象             |
| isProxy                 | 判读目标是否为代理对象             |
| isProtected             | 判断代理对象是否受保护             |
| isReadonly              | 判断代理对象是否只读               |
| isProtectAuth           | 判断代理对象是否已通过保护赋值认证 |
| isArrayOperateIntercept | 代理对象是否启用数组操作拦截       |
| protect                 | 保护代理对象或其属性               |
| readonly                | 设置代理对象或其属性为只读         |
| watchProxy              | 为代理对象添加观察                 |
| addWatch                | 为代理对象下的属性添加观察         |
| getTarget               | 获取代理对象原始目标数据           |
| getSuperiorProxy        | 获取上级代理对象                   |
| getProxyOptions         | 获取代理选项                       |
| getProxyDataSet         | 获取代理数据集                     |
| getProxyPath            | 获取代理对象或其属性数据路径       |
| getOriginValue          | 获取代理对象或其属性初始值         |
| getDataRecord           | 获取代理对象或其属性的数据记录     |
