export function echo(v) {
  return v;
}

export function createDOMElement(
  tag,
  {
    child,
    id,
    className,
    title,
    text,
    innerText,
    innerHTML,
    src,
    href,
    target,
    colSpan,
    rowSpan,
    whiteSpace,
    width,
    height,
  } = {}
) {
  //console.log('whiteSpace', whiteSpace);
  // console.log('colSpan, rowSpan', colSpan, rowSpan);
  const elem = document.createElement(tag);
  //console.log('createDOMElement', src, elem);
  if (className) {
    elem.className = className;
  }
  if (id) {
    elem.id = id;
  }
  if (title) {
    elem.title = title;
  }
  if (colSpan) {
    elem.colSpan = colSpan;
  }
  if (rowSpan) {
    elem.rowSpan = rowSpan;
  }
  if (text) {
    elem.textContent = text;
  }
  if (innerText) {
    elem.innerText = innerText;
  }
  if (innerHTML) {
    elem.innerHTML = innerHTML;
  }
  if (src) {
    elem.src = src;
  }
  if (href) {
    elem.href = href;
  }
  if (target) {
    elem.target = target;
  }
  if (width) {
    elem.style.display = 'inline-block';
    elem.style.minWidth = width;
  }
  if (height) {
    elem.style.display = 'inline-block';
    elem.style.height = height;
  }
  if (whiteSpace) {
    elem.style.display = 'inline-block';
    elem.style.whiteSpace = whiteSpace;
  }
  if (child) {
    elem.appendChild(child);
  }
  return elem;
}
