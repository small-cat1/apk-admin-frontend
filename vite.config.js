import Banner from 'vite-plugin-banner'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import vuePlugin from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueFilePathPlugin from './vitePlugin/componentName/index.js'
import {svgBuilder} from 'vite-auto-import-svg'
import {AddSecret} from './vitePlugin/secret'
import UnoCSS from '@unocss/vite'

// @see https://cn.vitejs.dev/config/
export default ({ mode }) => {
  AddSecret('')
  const NODE_ENV = mode || 'development'
  const envFiles = [`.env.${NODE_ENV}`]
  for (const file of envFiles) {
    const envConfig = dotenv.parse(fs.readFileSync(file))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }

  const timestamp = Date.parse(new Date())

  // 修复：优化依赖预构建配置
  const optimizeDeps = {
    include: ['vant/lib/icon/index'],
    exclude: []
  }

  const alias = {
    '@': path.resolve(__dirname, './src'),
    vue$: 'vue/dist/vue.runtime.esm-bundler.js'
  }

  const esbuild = {}

  // 修复：暂时移除 manualChunks，让 Vite 自动处理分包
  const rollupOptions = {
    output: {
      entryFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
      chunkFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
      assetFileNames: 'assets/087AC4D233B64EB0[name].[hash].[ext]'
      // 暂时注释掉 manualChunks
    }
  }

  const base = "/"
  const root = "./"
  const outDir = "dist"

  return {
    base: base,
    root: root,
    publicDir: 'public',
    resolve: {
      alias,
      // 添加这个配置，确保依赖解析正确
      dedupe: ['vue', 'vant']
    },
    define: {
      'process.env': {}
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    server: {
      open: process.env.VITE_OPEN_BROWSER === 'true' || false,
      port: process.env.VITE_CLI_PORT,
      proxy: {
        [process.env.VITE_BASE_API]: {
          target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`,
          changeOrigin: true,
          rewrite: (path) =>
              path.replace(new RegExp('^' + process.env.VITE_BASE_API), '')
        }
      }
    },
    build: {
      minify: 'terser',
      manifest: false,
      sourcemap: false,
      outDir: outDir,
      rollupOptions,
      // 修复：调整 chunk 大小限制
      chunkSizeWarningLimit: 1000,
      esbuildOptions: {
        drop: ['console', 'debugger']
      },
      // 添加 commonjs 配置
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    },
    esbuild,
    optimizeDeps,
    plugins: [
      process.env.VITE_POSITION === 'open' &&
      vueDevTools({launchEditor: process.env.VITE_EDITOR}),
      vuePlugin({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'emoji-picker'
          }
        }
      }),
      svgBuilder(['./src/plugin/', './src/assets/icons/'], base, outDir, 'assets', NODE_ENV),
      [Banner(`\n Build based on gin-vue-admin \n Time : ${timestamp}`)],
      VueFilePathPlugin('./src/pathInfo.json'),
      UnoCSS()
    ]
  }
}