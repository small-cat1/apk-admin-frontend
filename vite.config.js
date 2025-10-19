import Banner from 'vite-plugin-banner'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import vuePlugin from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {svgBuilder} from 'vite-auto-import-svg'
import UnoCSS from '@unocss/vite'

// @see https://cn.vitejs.dev/config/
export default ({ mode }) => {
  const NODE_ENV = mode || 'development'
  const envFiles = [`.env.${NODE_ENV}`]
  for (const file of envFiles) {
    const envConfig = dotenv.parse(fs.readFileSync(file))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }

  const timestamp = Date.parse(new Date())

  const optimizeDeps = {
    include: [],
    exclude: []
  }

  const alias = {
    '@': path.resolve(__dirname, './src'),
    vue$: 'vue/dist/vue.runtime.esm-bundler.js'
  }

  const rollupOptions = {
    output: {
      entryFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
      chunkFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
      assetFileNames: 'assets/087AC4D233B64EB0[name].[hash].[ext]'

    },
    external: [],
    onwarn(warning) {
      // 忽略某些警告
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }
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
      dedupe: ['vue']
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
      chunkSizeWarningLimit: 1000,
      esbuildOptions: {
        drop: ['console', 'debugger'],
        exclude: []
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      },
      // 添加 terser 的配置，防止重复声明
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          // 防止混淆导致的变量冲突
          keep_fnames: false
        }
      }
    },
    optimizeDeps,
    plugins: [
      process.env.NODE_ENV === 'development' &&
      process.env.VITE_POSITION === 'open' &&
      vueDevTools({launchEditor: process.env.VITE_EDITOR}),
      vuePlugin({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'emoji-picker'
          }
        }
      }),
      svgBuilder('./src/assets/icons/', {
        path: './src/assets/icons/',
        outputDir: outDir,
        prefix: 'icon',
        secretCode: '', // 添加这个必需的参数
      }),
      [Banner(`\n Build based on apk-admin \n Time : ${timestamp}`)],
      UnoCSS()
    ].filter(Boolean)
  }
}