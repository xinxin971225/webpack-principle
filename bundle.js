// 获取主入口文件
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')
const getModuleInfo = (file)=>{
    const body = fs.readFileSync(file,'utf-8')
    //解析代码
    const ast = parser.parse(body,{
        sourceType:'module'// 表示要解析的是es
    })

    //收集依赖
    const deps = {}
    traverse(ast,{
        ImportDeclaration({node}){
            const dirname = path.dirname(file)
            const abspath = './' + path.join(dirname,node.source.value)
            deps[node.source.value] = abspath
        }
    })
    
    //转换ES5
    const {code} = babel.transformFromAst(ast,null,{
        presets:["@babel/preset-env"]
    })

    //返回数据
    const moduleInfo = {file,deps,code}
    return moduleInfo
}

//遍历递归获取模块
const parseModules = (file)=>{
    const entry = getModuleInfo(file)
    const temp = [entry]
    const depsGraph = {} //新建空对象
    for(let i=0;i<temp.length;i++){
        const deps = temp[i].deps
        if(deps){
            for(const key in deps){
                temp.push(getModuleInfo(deps[key]))
            }
        }
    }
    //以文件的路径为key，{code，deps}为值的形式存储
    temp.forEach(moduleInfo=>{
        depsGraph[moduleInfo.file]={
            deps:moduleInfo.deps,
            code:moduleInfo.code
        }
    })
    return depsGraph
}

//
const bundle = (file) =>{
    const depsGraph = JSON.stringify(parseModules(file))
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`
}
const content = bundle("./src/index.js")

fs.mkdirSync('./dist');
fs.writeFileSync('./dist/bundle.js',content)
console.log(content)
