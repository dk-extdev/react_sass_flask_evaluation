/**
 * Created by rayde on 1/8/2018.
 */

import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf'

import Promise from 'promise-polyfill';

export const numToCurrency = (num, minimumFractionDigits=0) => {
    const formatter = Intl == null ? false : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits
    });
    if (formatter) {
        return formatter.format(num)
    }
    return (num).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
};

export const precisionRounding = (number, precision) => {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

export const exportHTMLToPDF = async (pages, outputType='blob', incrementSaveProgress, action=null) => {
  //let currentWindowWidth = window.innerWidth;
  const dpi = window.devicePixelRatio * 96;
  //console.log('DPI: ', dpi);
  const opt = {
    margin:       [0,0],
    filename:     'myfile.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { dpi, letterRendering: true, useCORS: true, javascriptEnabled: true},
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  const doc = new jsPDF(opt.jsPDF);
  //const pageSize = jsPDF.getPageSize(opt.jsPDF);
  var width = doc.internal.pageSize.getWidth();
  var height = doc.internal.pageSize.getHeight();
  // console.log('Page Size: ', pageSize);
  //const heightJS = '<script>$(document).ready(function () {$(".pdf-container").height($(window).height() * 1.1)})</script>';
  for(let i = 0; i < pages.length; i++){
    const page = pages[i];
    //const pdfPageSize = await html2pdf().from(page).set(opt).get('pageSize');
    const worker = html2pdf();
    await worker.set(opt);
    await worker.from(page);
    // const pdfPageSize = await worker.get('pageSize');
    const pageImage = await worker.outputImg();
    //console.log('HTML2PDF Page Size: ', pdfPageSize);
    // if(i == 0){
    //   console.log('Image: ', pageImage);
    // }
    if(i != 0) {
      doc.addPage();
    }
    doc.addImage(pageImage.src, 'jpeg', opt.margin[0], opt.margin[1], width, height);
    incrementSaveProgress();
  }
  const pdf = doc.output(outputType);
  //window.innerWidth = currentWindowWidth;
  if(action == null){
    return pdf;
  }
  else {
    action(pdf);
  }
}

// export function UrlToDataURI(fileUrl){
//   console.log('Inside urlToDAtaURI: ', fileURl)
//   return new Promise(function(resolve, reject){
//     return fetch(`/evaluation/file_proxy?url=${fileURl}`, {
//       method: 'GET',
//       credentials: 'include'
//     }).then((response) => response.blob())
//     .then((blob) => {
//       let reader = new FileReader();
//       reader.onloadend = function(){
//         console.log('I am being resolved.');
//         resolve(reader.result);
//       }
//       reader.readAsDataURL(blob);
//     }).catch(err => reject(err));
//   });
// }

export const UrlToDataURI = (fileUrl, fileType='dataUri') => {
  return fetch(`/evaluation/file_proxy?url=${fileUrl}`, {
    method: 'GET',
    credentials: 'include'
  }).then(response => response.blob())
  .then(blob => {
    // return new Promise((resolve, reject) => {
    //   let reader = new FileReader();
    //   reader.onloadend = function(){
    //     resolve(reader.result);
    //   }
    //   reader.onerror = function(){
    //     reject(reader.error);
    //   }
    //   // if(fileType=='binary'){
    //   //   reader.readAsBinaryString(blob);
    //   // }
    //   // else {
    //   //   reader.readAsDataURL(blob);
    //   // }
    //   reader.readAsDataURL(blob);
    // })
    return URL.createObjectURL(blob);
  })
}
