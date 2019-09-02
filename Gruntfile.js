const { email, password, copyPath } = require('./secret')

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps-get')
    grunt.loadNpmTasks('grunt-screeps')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks("grunt-ts")
    grunt.loadNpmTasks('grunt-contrib-copy')

    grunt.initConfig({
        // screeps 代码下载任务
        'screeps-get': {
            default: {
                options: {
                    email: email,
                    password: password,
                    branch: 'default',
                    ptr: false
                },
                saveDir: 'src/'
            }
        },
        // screeps 代码上传任务
        'screeps': {
            options: {
                email: email,
                password: password,
                branch: 'default',
                ptr: false
            },
            dist: {
                src: ['src/*.{js,wasm}'],
            }
        },
        // typescripts 编译任务
        'ts': {
            default : {
                options: {
                    sourceMap: false,
                    target: 'es5',
                    rootDir: "src/"
                },
                src: ["src/*.ts"],
                outDir: 'dist/'
            }
        },
        'copy': {
            main: {
                expand: true,
                cwd: 'dist',
                src: '**',
                dest: copyPath
            }
        },
        // 代码监听任务
        'watch': {
            files: "src/*.*",
            tasks: [ "ts", "copy" ]
        }
    })
}