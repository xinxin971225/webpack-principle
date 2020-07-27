# webpack-principle
### webpack练习原理demo
***
1.1 打包的主要流程如下

- 需要读到入口文件里面的内容。
- 分析入口文件，递归的去读取模块所依赖的文件内容，生成AST语法树。
- 根据AST语法树，生成浏览器能够运行的代码
1.2 具体细节

1.获取主模块内容分析模块

2.分析模块
- 安装@babel/parser包（转AST）

3.对模块内容进行处理

- 安装@babel/traverse包（遍历AST收集依赖）
- 安装@babel/core和@babel/preset-env包   （es6转ES5）

4.递归所有模块

5.生成最终代码
