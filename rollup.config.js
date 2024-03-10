
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';

const banner= `
/*
  Project: ZikoDB.js
  Author: Zakaria Elalaoui
  Date : ${new Date()}
  Git-Repo : https://github.com/zakarialaoui10/ZikoDB.js
  Git-Wiki : https://github.com/zakarialaoui10/ZikoDB.js/wiki
  Released under MIT License
*/
`
export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/zikodb.cjs',
    format: 'cjs',
    banner,
  },{
    file: 'dist/zikodb.mjs',
    format: 'es',
    banner,
  }  
],
  plugins: [
    resolve(), 
    commonjs(),
    livereload({
      watch:"src"
    }) 
  ],
};
