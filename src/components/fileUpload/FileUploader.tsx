import { jsx as n, jsxs as e, Fragment as r } from 'react/jsx-runtime';
import t, { css as o } from 'styled-components';
import React, { useState as i, useCallback as a, useEffect as l, useRef as s } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

var p: {
  <T extends {}, U>(target: T, source: U): T & U;
  <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
  <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
  (target: object, ...sources: any[]): any;
} = function() {
  return (
    (p =
      Object.assign ||
      function(n) {
        for (var e, r = 1, t = arguments.length; r < t; r++)
          for (var o in (e = arguments[r]))
            Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
        return n;
      }),
    p.apply(this, arguments)
  );
};
function d(n, e) {
  return Object.defineProperty ? Object.defineProperty(n, 'raw', { value: e }) : (n.raw = e), n;
}
var c,
  u,
  f,
  v,
  h,
  x = o(
    c ||
      (c = d(
        [
          '\n  display: flex;\n  align-items: center;\n  min-width: 600px;\n  max-width: 800px;\n  height: 350px;\n  border: solid 2px ',
          ';\n  padding: 8px 16px 8px 8px;\n  border-radius: 5px;\n  cursor: pointer;\n  flex-grow: 0;\n\n  &.is-disabled {\n    border: solid 2px ',
          ';\n    cursor: no-drop;\n    svg {\n      fill: ',
          ';\n      color: ',
          ';\n      path {\n        fill: ',
          ';\n        color: ',
          ';\n      }\n    }\n  }\n'
        ],
        [
          '\n  display: flex;\n  align-items: center;\n  min-width: 600px;\n  max-width: 800px;\n  height: 350px;\n  border: solid 2px ',
          ';\n  padding: 8px 16px 8px 8px;\n  border-radius: 5px;\n  cursor: pointer;\n  flex-grow: 0;\n\n  &.is-disabled {\n    border: solid 2px ',
          ';\n    cursor: no-drop;\n    svg {\n      fill: ',
          ';\n      color: ',
          ';\n      path {\n        fill: ',
          ';\n        color: ',
          ';\n      }\n    }\n  }\n'
        ]
      )),
    '#000000',
    '#666',
    '#666',
    '#666',
    '#666',
    '#666'
  ),
  g = t.label(
    u ||
      (u = d(
        [
          '\n  position: relative;\n  ',
          ';\n  &:focus-within {\n    outline: 2px solid black;\n  }\n  & > input {\n    display: block;\n    opacity: 0;\n    position: absolute;\n    pointer-events: none;\n  }\n'
        ],
        [
          '\n  position: relative;\n  ',
          ';\n  &:focus-within {\n    outline: 2px solid black;\n  }\n  & > input {\n    display: block;\n    opacity: 0;\n    position: absolute;\n    pointer-events: none;\n  }\n'
        ]
      )),
    function(n) {
      return n.overRide ? '' : x;
    }
  ),
  m = t.div(
    f ||
      (f = d(
        [
          '\n  border: solid 2px ',
          ';\n  border-radius: 5px;\n  background-color: ',
          ';\n  opacity: 0.5;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  & > span {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translateX(-50%) translateY(-50%);\n  }\n'
        ],
        [
          '\n  border: solid 2px ',
          ';\n  border-radius: 5px;\n  background-color: ',
          ';\n  opacity: 0.5;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  & > span {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translateX(-50%) translateY(-50%);\n  }\n'
        ]
      )),
    '#000000',
    '#000000'
  ),
  b = t.div(
    v ||
      (v = d(
        [
          '\n  display: flex;\n  justify-content: space-between;\n  flex-grow: 1;\n  & > span {\n    font-size: 20px;\n    color: ',
          ';\n  }\n  .file-types {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    max-width: 80px;\n  }\n'
        ],
        [
          '\n  display: flex;\n  justify-content: space-between;\n  flex-grow: 1;\n  & > span {\n    font-size: 20px;\n    color: ',
          ';\n  }\n  .file-types {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    max-width: 80px;\n  }\n'
        ]
      ))
  ),
  w = t.span(
    h ||
      (h = d(
        ['\n  font-size: 14px;\n  color: ', ';\n  span {\n    text-decoration: underline;\n  }\n'],
        ['\n  font-size: 14px;\n  color: ', ';\n  span {\n    text-decoration: underline;\n  }\n']
      )),
    '#000000'
  ),
  y = function(n) {
    return n / 1e3 / 1e3;
  },
  z = function(n) {
    return void 0 === n
      ? ''
      : n
          .map(function(n) {
            return '.'.concat(n.toLowerCase());
          })
          .join(',');
  };
function L(e) {
  var r = e.types,
    t = e.minSize,
    o = e.maxSize;
  if (r) {
    var i = r.toString(),
      a = '';
    return (
      o && (a += 'size >= '.concat(o, ', ')),
      t && (a += 'size <= '.concat(t, ', ')),
      n(
        'span',
        p({ title: ''.concat(a, 'types: ').concat(i), className: 'file-types' }, { children: i }),
        void 0
      )
    );
  }
  return null;
}
function C() {
  return <CloudUploadIcon />;
}
var H = 0;
var k = function(t, o, i, a, l) {
    return i
      ? n('span', { children: 'File type/size error, Hovered on types!' }, void 0)
      : n(
          w,
          {
            children: a
              ? n('span', { children: 'Upload disabled' }, void 0)
              : t || o
              ? e(r, { children: [n('span', { children: 'File Selected' }, void 0)] }, void 0)
              : n(
                  r,
                  {
                    children: e(
                      r,
                      l
                        ? {
                            children: [
                              n('span', { children: l.split(' ')[0] }, void 0),
                              ' ',
                              l.substr(l.indexOf(' ') + 1)
                            ]
                          }
                        : {
                            children: [
                              n('span', { children: '' }, void 0),
                              'Drag and drop files to upload'
                            ]
                          },
                      void 0
                    )
                  },
                  void 0
                )
          },
          void 0
        );
  },
  E = function(t) {
    var o = t.name,
      d = t.hoverTitle,
      c = t.types,
      u = t.handleChange,
      f = t.classes,
      v = t.children,
      h = t.maxSize,
      x = t.minSize,
      w = t.fileOrFiles,
      E = t.onSizeError,
      S = t.onTypeError,
      V = t.onSelect,
      D = t.onDrop,
      P = t.disabled,
      j = t.label,
      F = t.multiple,
      O = t.required,
      R = t.onDraggingStateChange,
      T = t.dropMessageStyle,
      M = s(null),
      U = s(null),
      Z = i(!1),
      q = Z[0],
      N = Z[1],
      X = i(null),
      Y = X[0],
      B = X[1],
      A = i(!1),
      G = A[0],
      I = A[1],
      J = function(n) {
        return c &&
          !(function(n, e) {
            var r = n.name.split('.').pop();
            return e
              .map(function(n) {
                return n.toLowerCase();
              })
              .includes(r.toLowerCase());
          })(n, c)
          ? (I(!0), S && S('File type is not supported'), !1)
          : h && y(n.size) > h
          ? (I(!0), E && E('File size is too big'), !1)
          : !(x && y(n.size) < x) || (I(!0), E && E('File size is too small'), !1);
      },
      K = function(n) {
        var e = !1;
        if (n) {
          if (n instanceof File) e = !J(n);
          else
            for (var r = 0; r < n.length; r++) {
              var t = n[r];
              e = !J(t) || e;
            }
          return !e && (u && u(n), B(n), N(!0), I(!1), !0);
        }
        return !1;
      },
      Q = (function(n) {
        var e = n.labelRef,
          r = n.inputRef,
          t = n.multiple,
          o = n.handleChanges,
          s = n.onDrop,
          p = i(!1),
          d = p[0],
          c = p[1],
          u = a(
            function() {
              r.current.click();
            },
            [r]
          ),
          f = a(function(n) {
            n.preventDefault(),
              n.stopPropagation(),
              H++,
              n.dataTransfer.items && 0 !== n.dataTransfer.items.length && c(!0);
          }, []),
          v = a(function(n) {
            n.preventDefault(), n.stopPropagation(), --H > 0 || c(!1);
          }, []),
          h = a(function(n) {
            n.preventDefault(), n.stopPropagation();
          }, []),
          x = a(
            function(n) {
              n.preventDefault(), n.stopPropagation(), c(!1), (H = 0);
              var e = n.dataTransfer.files;
              if (e && e.length > 0) {
                var r = t ? e : e[0],
                  i = o(r);
                s && i && s(r);
              }
            },
            [o]
          );
        return (
          l(
            function() {
              var n = e.current;
              return (
                n.addEventListener('click', u),
                n.addEventListener('dragenter', f),
                n.addEventListener('dragleave', v),
                n.addEventListener('dragover', h),
                n.addEventListener('drop', x),
                function() {
                  n.removeEventListener('click', u),
                    n.removeEventListener('dragenter', f),
                    n.removeEventListener('dragleave', v),
                    n.removeEventListener('dragover', h),
                    n.removeEventListener('drop', x);
                }
              );
            },
            [u, f, v, h, x, e]
          ),
          d
        );
      })({ labelRef: M, inputRef: U, multiple: F, handleChanges: K, onDrop: D });
    return (
      l(
        function() {
          null == R || R(Q);
        },
        [Q]
      ),
      l(
        function() {
          w ? (N(!0), B(w)) : (U.current && (U.current.value = ''), N(!1), B(null));
        },
        [w]
      ),
      e(
        g,
        p(
          {
            overRide: v,
            className: ''.concat(f || '', ' ').concat(P ? 'is-disabled' : ''),
            ref: M,
            htmlFor: o,
            onClick: function(n) {
              n.preventDefault(), n.stopPropagation();
            }
          },
          {
            children: [
              n(
                'input',
                {
                  onClick: function(n) {
                    n.stopPropagation(),
                      U && U.current && ((U.current.value = ''), U.current.click());
                  },
                  onChange: function(n) {
                    var e = n.target.files,
                      r = F ? e : e[0],
                      t = K(r);
                    V && t && V(r);
                  },
                  accept: z(c),
                  ref: U,
                  type: 'file',
                  name: o,
                  disabled: P,
                  multiple: F,
                  required: O
                },
                void 0
              ),
              Q &&
                n(
                  m,
                  p({ style: T }, { children: n('span', { children: d || 'Drop Here' }, void 0) }),
                  void 0
                ),
              !v &&
                e(
                  r,
                  {
                    children: [
                      n(C, {}, void 0),
                      e(
                        b,
                        p(
                          { error: G },
                          {
                            children: [
                              k(Y, q, G, P, j),
                              n(L, { types: c, minSize: x, maxSize: h }, void 0)
                            ]
                          }
                        ),
                        void 0
                      )
                    ]
                  },
                  void 0
                ),
              v
            ]
          }
        ),
        void 0
      )
    );
  };
export { E as FileUploader };
