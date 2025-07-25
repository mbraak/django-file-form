(function () {

  const findForm = element => {
    const parent = element.parentElement;
    if (!parent) {
      return null;
    }
    if (parent.tagName === "FORM") {
      return parent;
    }
    return findForm(parent);
  };
  const unique = values => Array.from(new Set(values).values());
  // eslint-disable-line @typescript-eslint/no-explicit-any

  const autoInitFileForms = () => {
    const initUploadFields = window.initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

    const forms = unique(Array.from(document.querySelectorAll(".dff-uploader")).map(findForm));
    forms.forEach(initUploadFields);
  };

  const types = {
      'application/andrew-inset': ['ez'],
      'application/appinstaller': ['appinstaller'],
      'application/applixware': ['aw'],
      'application/appx': ['appx'],
      'application/appxbundle': ['appxbundle'],
      'application/atom+xml': ['atom'],
      'application/atomcat+xml': ['atomcat'],
      'application/atomdeleted+xml': ['atomdeleted'],
      'application/atomsvc+xml': ['atomsvc'],
      'application/atsc-dwd+xml': ['dwd'],
      'application/atsc-held+xml': ['held'],
      'application/atsc-rsat+xml': ['rsat'],
      'application/automationml-aml+xml': ['aml'],
      'application/automationml-amlx+zip': ['amlx'],
      'application/bdoc': ['bdoc'],
      'application/calendar+xml': ['xcs'],
      'application/ccxml+xml': ['ccxml'],
      'application/cdfx+xml': ['cdfx'],
      'application/cdmi-capability': ['cdmia'],
      'application/cdmi-container': ['cdmic'],
      'application/cdmi-domain': ['cdmid'],
      'application/cdmi-object': ['cdmio'],
      'application/cdmi-queue': ['cdmiq'],
      'application/cpl+xml': ['cpl'],
      'application/cu-seeme': ['cu'],
      'application/cwl': ['cwl'],
      'application/dash+xml': ['mpd'],
      'application/dash-patch+xml': ['mpp'],
      'application/davmount+xml': ['davmount'],
      'application/dicom': ['dcm'],
      'application/docbook+xml': ['dbk'],
      'application/dssc+der': ['dssc'],
      'application/dssc+xml': ['xdssc'],
      'application/ecmascript': ['ecma'],
      'application/emma+xml': ['emma'],
      'application/emotionml+xml': ['emotionml'],
      'application/epub+zip': ['epub'],
      'application/exi': ['exi'],
      'application/express': ['exp'],
      'application/fdf': ['fdf'],
      'application/fdt+xml': ['fdt'],
      'application/font-tdpfr': ['pfr'],
      'application/geo+json': ['geojson'],
      'application/gml+xml': ['gml'],
      'application/gpx+xml': ['gpx'],
      'application/gxf': ['gxf'],
      'application/gzip': ['gz'],
      'application/hjson': ['hjson'],
      'application/hyperstudio': ['stk'],
      'application/inkml+xml': ['ink', 'inkml'],
      'application/ipfix': ['ipfix'],
      'application/its+xml': ['its'],
      'application/java-archive': ['jar', 'war', 'ear'],
      'application/java-serialized-object': ['ser'],
      'application/java-vm': ['class'],
      'application/javascript': ['*js'],
      'application/json': ['json', 'map'],
      'application/json5': ['json5'],
      'application/jsonml+json': ['jsonml'],
      'application/ld+json': ['jsonld'],
      'application/lgr+xml': ['lgr'],
      'application/lost+xml': ['lostxml'],
      'application/mac-binhex40': ['hqx'],
      'application/mac-compactpro': ['cpt'],
      'application/mads+xml': ['mads'],
      'application/manifest+json': ['webmanifest'],
      'application/marc': ['mrc'],
      'application/marcxml+xml': ['mrcx'],
      'application/mathematica': ['ma', 'nb', 'mb'],
      'application/mathml+xml': ['mathml'],
      'application/mbox': ['mbox'],
      'application/media-policy-dataset+xml': ['mpf'],
      'application/mediaservercontrol+xml': ['mscml'],
      'application/metalink+xml': ['metalink'],
      'application/metalink4+xml': ['meta4'],
      'application/mets+xml': ['mets'],
      'application/mmt-aei+xml': ['maei'],
      'application/mmt-usd+xml': ['musd'],
      'application/mods+xml': ['mods'],
      'application/mp21': ['m21', 'mp21'],
      'application/mp4': ['*mp4', '*mpg4', 'mp4s', 'm4p'],
      'application/msix': ['msix'],
      'application/msixbundle': ['msixbundle'],
      'application/msword': ['doc', 'dot'],
      'application/mxf': ['mxf'],
      'application/n-quads': ['nq'],
      'application/n-triples': ['nt'],
      'application/node': ['cjs'],
      'application/octet-stream': [
          'bin',
          'dms',
          'lrf',
          'mar',
          'so',
          'dist',
          'distz',
          'pkg',
          'bpk',
          'dump',
          'elc',
          'deploy',
          'exe',
          'dll',
          'deb',
          'dmg',
          'iso',
          'img',
          'msi',
          'msp',
          'msm',
          'buffer',
      ],
      'application/oda': ['oda'],
      'application/oebps-package+xml': ['opf'],
      'application/ogg': ['ogx'],
      'application/omdoc+xml': ['omdoc'],
      'application/onenote': [
          'onetoc',
          'onetoc2',
          'onetmp',
          'onepkg',
          'one',
          'onea',
      ],
      'application/oxps': ['oxps'],
      'application/p2p-overlay+xml': ['relo'],
      'application/patch-ops-error+xml': ['xer'],
      'application/pdf': ['pdf'],
      'application/pgp-encrypted': ['pgp'],
      'application/pgp-keys': ['asc'],
      'application/pgp-signature': ['sig', '*asc'],
      'application/pics-rules': ['prf'],
      'application/pkcs10': ['p10'],
      'application/pkcs7-mime': ['p7m', 'p7c'],
      'application/pkcs7-signature': ['p7s'],
      'application/pkcs8': ['p8'],
      'application/pkix-attr-cert': ['ac'],
      'application/pkix-cert': ['cer'],
      'application/pkix-crl': ['crl'],
      'application/pkix-pkipath': ['pkipath'],
      'application/pkixcmp': ['pki'],
      'application/pls+xml': ['pls'],
      'application/postscript': ['ai', 'eps', 'ps'],
      'application/provenance+xml': ['provx'],
      'application/pskc+xml': ['pskcxml'],
      'application/raml+yaml': ['raml'],
      'application/rdf+xml': ['rdf', 'owl'],
      'application/reginfo+xml': ['rif'],
      'application/relax-ng-compact-syntax': ['rnc'],
      'application/resource-lists+xml': ['rl'],
      'application/resource-lists-diff+xml': ['rld'],
      'application/rls-services+xml': ['rs'],
      'application/route-apd+xml': ['rapd'],
      'application/route-s-tsid+xml': ['sls'],
      'application/route-usd+xml': ['rusd'],
      'application/rpki-ghostbusters': ['gbr'],
      'application/rpki-manifest': ['mft'],
      'application/rpki-roa': ['roa'],
      'application/rsd+xml': ['rsd'],
      'application/rss+xml': ['rss'],
      'application/rtf': ['rtf'],
      'application/sbml+xml': ['sbml'],
      'application/scvp-cv-request': ['scq'],
      'application/scvp-cv-response': ['scs'],
      'application/scvp-vp-request': ['spq'],
      'application/scvp-vp-response': ['spp'],
      'application/sdp': ['sdp'],
      'application/senml+xml': ['senmlx'],
      'application/sensml+xml': ['sensmlx'],
      'application/set-payment-initiation': ['setpay'],
      'application/set-registration-initiation': ['setreg'],
      'application/shf+xml': ['shf'],
      'application/sieve': ['siv', 'sieve'],
      'application/smil+xml': ['smi', 'smil'],
      'application/sparql-query': ['rq'],
      'application/sparql-results+xml': ['srx'],
      'application/sql': ['sql'],
      'application/srgs': ['gram'],
      'application/srgs+xml': ['grxml'],
      'application/sru+xml': ['sru'],
      'application/ssdl+xml': ['ssdl'],
      'application/ssml+xml': ['ssml'],
      'application/swid+xml': ['swidtag'],
      'application/tei+xml': ['tei', 'teicorpus'],
      'application/thraud+xml': ['tfi'],
      'application/timestamped-data': ['tsd'],
      'application/toml': ['toml'],
      'application/trig': ['trig'],
      'application/ttml+xml': ['ttml'],
      'application/ubjson': ['ubj'],
      'application/urc-ressheet+xml': ['rsheet'],
      'application/urc-targetdesc+xml': ['td'],
      'application/voicexml+xml': ['vxml'],
      'application/wasm': ['wasm'],
      'application/watcherinfo+xml': ['wif'],
      'application/widget': ['wgt'],
      'application/winhlp': ['hlp'],
      'application/wsdl+xml': ['wsdl'],
      'application/wspolicy+xml': ['wspolicy'],
      'application/xaml+xml': ['xaml'],
      'application/xcap-att+xml': ['xav'],
      'application/xcap-caps+xml': ['xca'],
      'application/xcap-diff+xml': ['xdf'],
      'application/xcap-el+xml': ['xel'],
      'application/xcap-ns+xml': ['xns'],
      'application/xenc+xml': ['xenc'],
      'application/xfdf': ['xfdf'],
      'application/xhtml+xml': ['xhtml', 'xht'],
      'application/xliff+xml': ['xlf'],
      'application/xml': ['xml', 'xsl', 'xsd', 'rng'],
      'application/xml-dtd': ['dtd'],
      'application/xop+xml': ['xop'],
      'application/xproc+xml': ['xpl'],
      'application/xslt+xml': ['*xsl', 'xslt'],
      'application/xspf+xml': ['xspf'],
      'application/xv+xml': ['mxml', 'xhvml', 'xvml', 'xvm'],
      'application/yang': ['yang'],
      'application/yin+xml': ['yin'],
      'application/zip': ['zip'],
      'application/zip+dotlottie': ['lottie'],
      'audio/3gpp': ['*3gpp'],
      'audio/aac': ['adts', 'aac'],
      'audio/adpcm': ['adp'],
      'audio/amr': ['amr'],
      'audio/basic': ['au', 'snd'],
      'audio/midi': ['mid', 'midi', 'kar', 'rmi'],
      'audio/mobile-xmf': ['mxmf'],
      'audio/mp3': ['*mp3'],
      'audio/mp4': ['m4a', 'mp4a', 'm4b'],
      'audio/mpeg': ['mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a'],
      'audio/ogg': ['oga', 'ogg', 'spx', 'opus'],
      'audio/s3m': ['s3m'],
      'audio/silk': ['sil'],
      'audio/wav': ['wav'],
      'audio/wave': ['*wav'],
      'audio/webm': ['weba'],
      'audio/xm': ['xm'],
      'font/collection': ['ttc'],
      'font/otf': ['otf'],
      'font/ttf': ['ttf'],
      'font/woff': ['woff'],
      'font/woff2': ['woff2'],
      'image/aces': ['exr'],
      'image/apng': ['apng'],
      'image/avci': ['avci'],
      'image/avcs': ['avcs'],
      'image/avif': ['avif'],
      'image/bmp': ['bmp', 'dib'],
      'image/cgm': ['cgm'],
      'image/dicom-rle': ['drle'],
      'image/dpx': ['dpx'],
      'image/emf': ['emf'],
      'image/fits': ['fits'],
      'image/g3fax': ['g3'],
      'image/gif': ['gif'],
      'image/heic': ['heic'],
      'image/heic-sequence': ['heics'],
      'image/heif': ['heif'],
      'image/heif-sequence': ['heifs'],
      'image/hej2k': ['hej2'],
      'image/ief': ['ief'],
      'image/jaii': ['jaii'],
      'image/jais': ['jais'],
      'image/jls': ['jls'],
      'image/jp2': ['jp2', 'jpg2'],
      'image/jpeg': ['jpg', 'jpeg', 'jpe'],
      'image/jph': ['jph'],
      'image/jphc': ['jhc'],
      'image/jpm': ['jpm', 'jpgm'],
      'image/jpx': ['jpx', 'jpf'],
      'image/jxl': ['jxl'],
      'image/jxr': ['jxr'],
      'image/jxra': ['jxra'],
      'image/jxrs': ['jxrs'],
      'image/jxs': ['jxs'],
      'image/jxsc': ['jxsc'],
      'image/jxsi': ['jxsi'],
      'image/jxss': ['jxss'],
      'image/ktx': ['ktx'],
      'image/ktx2': ['ktx2'],
      'image/pjpeg': ['jfif'],
      'image/png': ['png'],
      'image/sgi': ['sgi'],
      'image/svg+xml': ['svg', 'svgz'],
      'image/t38': ['t38'],
      'image/tiff': ['tif', 'tiff'],
      'image/tiff-fx': ['tfx'],
      'image/webp': ['webp'],
      'image/wmf': ['wmf'],
      'message/disposition-notification': ['disposition-notification'],
      'message/global': ['u8msg'],
      'message/global-delivery-status': ['u8dsn'],
      'message/global-disposition-notification': ['u8mdn'],
      'message/global-headers': ['u8hdr'],
      'message/rfc822': ['eml', 'mime', 'mht', 'mhtml'],
      'model/3mf': ['3mf'],
      'model/gltf+json': ['gltf'],
      'model/gltf-binary': ['glb'],
      'model/iges': ['igs', 'iges'],
      'model/jt': ['jt'],
      'model/mesh': ['msh', 'mesh', 'silo'],
      'model/mtl': ['mtl'],
      'model/obj': ['obj'],
      'model/prc': ['prc'],
      'model/step': ['step', 'stp', 'stpnc', 'p21', '210'],
      'model/step+xml': ['stpx'],
      'model/step+zip': ['stpz'],
      'model/step-xml+zip': ['stpxz'],
      'model/stl': ['stl'],
      'model/u3d': ['u3d'],
      'model/vrml': ['wrl', 'vrml'],
      'model/x3d+binary': ['*x3db', 'x3dbz'],
      'model/x3d+fastinfoset': ['x3db'],
      'model/x3d+vrml': ['*x3dv', 'x3dvz'],
      'model/x3d+xml': ['x3d', 'x3dz'],
      'model/x3d-vrml': ['x3dv'],
      'text/cache-manifest': ['appcache', 'manifest'],
      'text/calendar': ['ics', 'ifb'],
      'text/coffeescript': ['coffee', 'litcoffee'],
      'text/css': ['css'],
      'text/csv': ['csv'],
      'text/html': ['html', 'htm', 'shtml'],
      'text/jade': ['jade'],
      'text/javascript': ['js', 'mjs'],
      'text/jsx': ['jsx'],
      'text/less': ['less'],
      'text/markdown': ['md', 'markdown'],
      'text/mathml': ['mml'],
      'text/mdx': ['mdx'],
      'text/n3': ['n3'],
      'text/plain': ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
      'text/richtext': ['rtx'],
      'text/rtf': ['*rtf'],
      'text/sgml': ['sgml', 'sgm'],
      'text/shex': ['shex'],
      'text/slim': ['slim', 'slm'],
      'text/spdx': ['spdx'],
      'text/stylus': ['stylus', 'styl'],
      'text/tab-separated-values': ['tsv'],
      'text/troff': ['t', 'tr', 'roff', 'man', 'me', 'ms'],
      'text/turtle': ['ttl'],
      'text/uri-list': ['uri', 'uris', 'urls'],
      'text/vcard': ['vcard'],
      'text/vtt': ['vtt'],
      'text/wgsl': ['wgsl'],
      'text/xml': ['*xml'],
      'text/yaml': ['yaml', 'yml'],
      'video/3gpp': ['3gp', '3gpp'],
      'video/3gpp2': ['3g2'],
      'video/h261': ['h261'],
      'video/h263': ['h263'],
      'video/h264': ['h264'],
      'video/iso.segment': ['m4s'],
      'video/jpeg': ['jpgv'],
      'video/jpm': ['*jpm', '*jpgm'],
      'video/mj2': ['mj2', 'mjp2'],
      'video/mp2t': ['ts', 'm2t', 'm2ts', 'mts'],
      'video/mp4': ['mp4', 'mp4v', 'mpg4'],
      'video/mpeg': ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
      'video/ogg': ['ogv'],
      'video/quicktime': ['qt', 'mov'],
      'video/webm': ['webm'],
  };
  Object.freeze(types);

  var __classPrivateFieldGet = (window && window.__classPrivateFieldGet) || function (receiver, state, kind, f) {
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
  var _Mime_extensionToType, _Mime_typeToExtension, _Mime_typeToExtensions;
  class Mime {
      constructor(...args) {
          _Mime_extensionToType.set(this, new Map());
          _Mime_typeToExtension.set(this, new Map());
          _Mime_typeToExtensions.set(this, new Map());
          for (const arg of args) {
              this.define(arg);
          }
      }
      define(typeMap, force = false) {
          for (let [type, extensions] of Object.entries(typeMap)) {
              type = type.toLowerCase();
              extensions = extensions.map((ext) => ext.toLowerCase());
              if (!__classPrivateFieldGet(this, _Mime_typeToExtensions, "f").has(type)) {
                  __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").set(type, new Set());
              }
              const allExtensions = __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").get(type);
              let first = true;
              for (let extension of extensions) {
                  const starred = extension.startsWith('*');
                  extension = starred ? extension.slice(1) : extension;
                  allExtensions?.add(extension);
                  if (first) {
                      __classPrivateFieldGet(this, _Mime_typeToExtension, "f").set(type, extension);
                  }
                  first = false;
                  if (starred)
                      continue;
                  const currentType = __classPrivateFieldGet(this, _Mime_extensionToType, "f").get(extension);
                  if (currentType && currentType != type && !force) {
                      throw new Error(`"${type} -> ${extension}" conflicts with "${currentType} -> ${extension}". Pass \`force=true\` to override this definition.`);
                  }
                  __classPrivateFieldGet(this, _Mime_extensionToType, "f").set(extension, type);
              }
          }
          return this;
      }
      getType(path) {
          if (typeof path !== 'string')
              return null;
          const last = path.replace(/^.*[/\\]/s, '').toLowerCase();
          const ext = last.replace(/^.*\./s, '').toLowerCase();
          const hasPath = last.length < path.length;
          const hasDot = ext.length < last.length - 1;
          if (!hasDot && hasPath)
              return null;
          return __classPrivateFieldGet(this, _Mime_extensionToType, "f").get(ext) ?? null;
      }
      getExtension(type) {
          if (typeof type !== 'string')
              return null;
          type = type?.split?.(';')[0];
          return ((type && __classPrivateFieldGet(this, _Mime_typeToExtension, "f").get(type.trim().toLowerCase())) ?? null);
      }
      getAllExtensions(type) {
          if (typeof type !== 'string')
              return null;
          return __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").get(type.toLowerCase()) ?? null;
      }
      _freeze() {
          this.define = () => {
              throw new Error('define() not allowed for built-in Mime objects. See https://github.com/broofa/mime/blob/main/README.md#custom-mime-instances');
          };
          Object.freeze(this);
          for (const extensions of __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").values()) {
              Object.freeze(extensions);
          }
          return this;
      }
      _getTestState() {
          return {
              types: __classPrivateFieldGet(this, _Mime_extensionToType, "f"),
              extensions: __classPrivateFieldGet(this, _Mime_typeToExtension, "f"),
          };
      }
  }
  _Mime_extensionToType = new WeakMap(), _Mime_typeToExtension = new WeakMap(), _Mime_typeToExtensions = new WeakMap();

  var mime = new Mime(types)._freeze();

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var utils = {};

  var constants;
  var hasRequiredConstants;

  function requireConstants () {
  	if (hasRequiredConstants) return constants;
  	hasRequiredConstants = 1;

  	const WIN_SLASH = '\\\\/';
  	const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

  	/**
  	 * Posix glob regex
  	 */

  	const DOT_LITERAL = '\\.';
  	const PLUS_LITERAL = '\\+';
  	const QMARK_LITERAL = '\\?';
  	const SLASH_LITERAL = '\\/';
  	const ONE_CHAR = '(?=.)';
  	const QMARK = '[^/]';
  	const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  	const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  	const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  	const NO_DOT = `(?!${DOT_LITERAL})`;
  	const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
  	const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
  	const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
  	const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
  	const STAR = `${QMARK}*?`;
  	const SEP = '/';

  	const POSIX_CHARS = {
  	  DOT_LITERAL,
  	  PLUS_LITERAL,
  	  QMARK_LITERAL,
  	  SLASH_LITERAL,
  	  ONE_CHAR,
  	  QMARK,
  	  END_ANCHOR,
  	  DOTS_SLASH,
  	  NO_DOT,
  	  NO_DOTS,
  	  NO_DOT_SLASH,
  	  NO_DOTS_SLASH,
  	  QMARK_NO_DOT,
  	  STAR,
  	  START_ANCHOR,
  	  SEP
  	};

  	/**
  	 * Windows glob regex
  	 */

  	const WINDOWS_CHARS = {
  	  ...POSIX_CHARS,

  	  SLASH_LITERAL: `[${WIN_SLASH}]`,
  	  QMARK: WIN_NO_SLASH,
  	  STAR: `${WIN_NO_SLASH}*?`,
  	  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  	  NO_DOT: `(?!${DOT_LITERAL})`,
  	  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  	  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  	  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  	  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  	  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  	  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
  	  SEP: '\\'
  	};

  	/**
  	 * POSIX Bracket Regex
  	 */

  	const POSIX_REGEX_SOURCE = {
  	  alnum: 'a-zA-Z0-9',
  	  alpha: 'a-zA-Z',
  	  ascii: '\\x00-\\x7F',
  	  blank: ' \\t',
  	  cntrl: '\\x00-\\x1F\\x7F',
  	  digit: '0-9',
  	  graph: '\\x21-\\x7E',
  	  lower: 'a-z',
  	  print: '\\x20-\\x7E ',
  	  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  	  space: ' \\t\\r\\n\\v\\f',
  	  upper: 'A-Z',
  	  word: 'A-Za-z0-9_',
  	  xdigit: 'A-Fa-f0-9'
  	};

  	constants = {
  	  MAX_LENGTH: 1024 * 64,
  	  POSIX_REGEX_SOURCE,

  	  // regular expressions
  	  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  	  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  	  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  	  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  	  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  	  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  	  // Replace globs with equivalent patterns to reduce parsing time.
  	  REPLACEMENTS: {
  	    __proto__: null,
  	    '***': '*',
  	    '**/**': '**',
  	    '**/**/**': '**'
  	  },

  	  // Digits
  	  CHAR_0: 48, /* 0 */
  	  CHAR_9: 57, /* 9 */

  	  // Alphabet chars.
  	  CHAR_UPPERCASE_A: 65, /* A */
  	  CHAR_LOWERCASE_A: 97, /* a */
  	  CHAR_UPPERCASE_Z: 90, /* Z */
  	  CHAR_LOWERCASE_Z: 122, /* z */

  	  CHAR_LEFT_PARENTHESES: 40, /* ( */
  	  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  	  CHAR_ASTERISK: 42, /* * */

  	  // Non-alphabetic chars.
  	  CHAR_AMPERSAND: 38, /* & */
  	  CHAR_AT: 64, /* @ */
  	  CHAR_BACKWARD_SLASH: 92, /* \ */
  	  CHAR_CARRIAGE_RETURN: 13, /* \r */
  	  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  	  CHAR_COLON: 58, /* : */
  	  CHAR_COMMA: 44, /* , */
  	  CHAR_DOT: 46, /* . */
  	  CHAR_DOUBLE_QUOTE: 34, /* " */
  	  CHAR_EQUAL: 61, /* = */
  	  CHAR_EXCLAMATION_MARK: 33, /* ! */
  	  CHAR_FORM_FEED: 12, /* \f */
  	  CHAR_FORWARD_SLASH: 47, /* / */
  	  CHAR_GRAVE_ACCENT: 96, /* ` */
  	  CHAR_HASH: 35, /* # */
  	  CHAR_HYPHEN_MINUS: 45, /* - */
  	  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  	  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  	  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  	  CHAR_LINE_FEED: 10, /* \n */
  	  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  	  CHAR_PERCENT: 37, /* % */
  	  CHAR_PLUS: 43, /* + */
  	  CHAR_QUESTION_MARK: 63, /* ? */
  	  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  	  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  	  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  	  CHAR_SEMICOLON: 59, /* ; */
  	  CHAR_SINGLE_QUOTE: 39, /* ' */
  	  CHAR_SPACE: 32, /*   */
  	  CHAR_TAB: 9, /* \t */
  	  CHAR_UNDERSCORE: 95, /* _ */
  	  CHAR_VERTICAL_LINE: 124, /* | */
  	  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  	  /**
  	   * Create EXTGLOB_CHARS
  	   */

  	  extglobChars(chars) {
  	    return {
  	      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
  	      '?': { type: 'qmark', open: '(?:', close: ')?' },
  	      '+': { type: 'plus', open: '(?:', close: ')+' },
  	      '*': { type: 'star', open: '(?:', close: ')*' },
  	      '@': { type: 'at', open: '(?:', close: ')' }
  	    };
  	  },

  	  /**
  	   * Create GLOB_CHARS
  	   */

  	  globChars(win32) {
  	    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  	  }
  	};
  	return constants;
  }

  /*global navigator*/

  var hasRequiredUtils;

  function requireUtils () {
  	if (hasRequiredUtils) return utils;
  	hasRequiredUtils = 1;
  	(function (exports) {

  		const {
  		  REGEX_BACKSLASH,
  		  REGEX_REMOVE_BACKSLASH,
  		  REGEX_SPECIAL_CHARS,
  		  REGEX_SPECIAL_CHARS_GLOBAL
  		} = /*@__PURE__*/ requireConstants();

  		exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
  		exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
  		exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
  		exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
  		exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

  		exports.isWindows = () => {
  		  if (typeof navigator !== 'undefined' && navigator.platform) {
  		    const platform = navigator.platform.toLowerCase();
  		    return platform === 'win32' || platform === 'windows';
  		  }

  		  if (typeof process !== 'undefined' && process.platform) {
  		    return process.platform === 'win32';
  		  }

  		  return false;
  		};

  		exports.removeBackslashes = str => {
  		  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
  		    return match === '\\' ? '' : match;
  		  });
  		};

  		exports.escapeLast = (input, char, lastIdx) => {
  		  const idx = input.lastIndexOf(char, lastIdx);
  		  if (idx === -1) return input;
  		  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  		  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
  		};

  		exports.removePrefix = (input, state = {}) => {
  		  let output = input;
  		  if (output.startsWith('./')) {
  		    output = output.slice(2);
  		    state.prefix = './';
  		  }
  		  return output;
  		};

  		exports.wrapOutput = (input, state = {}, options = {}) => {
  		  const prepend = options.contains ? '' : '^';
  		  const append = options.contains ? '' : '$';

  		  let output = `${prepend}(?:${input})${append}`;
  		  if (state.negated === true) {
  		    output = `(?:^(?!${output}).*$)`;
  		  }
  		  return output;
  		};

  		exports.basename = (path, { windows } = {}) => {
  		  const segs = path.split(windows ? /[\\/]/ : '/');
  		  const last = segs[segs.length - 1];

  		  if (last === '') {
  		    return segs[segs.length - 2];
  		  }

  		  return last;
  		}; 
  	} (utils));
  	return utils;
  }

  var scan_1;
  var hasRequiredScan;

  function requireScan () {
  	if (hasRequiredScan) return scan_1;
  	hasRequiredScan = 1;

  	const utils = /*@__PURE__*/ requireUtils();
  	const {
  	  CHAR_ASTERISK,             /* * */
  	  CHAR_AT,                   /* @ */
  	  CHAR_BACKWARD_SLASH,       /* \ */
  	  CHAR_COMMA,                /* , */
  	  CHAR_DOT,                  /* . */
  	  CHAR_EXCLAMATION_MARK,     /* ! */
  	  CHAR_FORWARD_SLASH,        /* / */
  	  CHAR_LEFT_CURLY_BRACE,     /* { */
  	  CHAR_LEFT_PARENTHESES,     /* ( */
  	  CHAR_LEFT_SQUARE_BRACKET,  /* [ */
  	  CHAR_PLUS,                 /* + */
  	  CHAR_QUESTION_MARK,        /* ? */
  	  CHAR_RIGHT_CURLY_BRACE,    /* } */
  	  CHAR_RIGHT_PARENTHESES,    /* ) */
  	  CHAR_RIGHT_SQUARE_BRACKET  /* ] */
  	} = /*@__PURE__*/ requireConstants();

  	const isPathSeparator = code => {
  	  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  	};

  	const depth = token => {
  	  if (token.isPrefix !== true) {
  	    token.depth = token.isGlobstar ? Infinity : 1;
  	  }
  	};

  	/**
  	 * Quickly scans a glob pattern and returns an object with a handful of
  	 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
  	 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
  	 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
  	 *
  	 * ```js
  	 * const pm = require('picomatch');
  	 * console.log(pm.scan('foo/bar/*.js'));
  	 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
  	 * ```
  	 * @param {String} `str`
  	 * @param {Object} `options`
  	 * @return {Object} Returns an object with tokens and regex source string.
  	 * @api public
  	 */

  	const scan = (input, options) => {
  	  const opts = options || {};

  	  const length = input.length - 1;
  	  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  	  const slashes = [];
  	  const tokens = [];
  	  const parts = [];

  	  let str = input;
  	  let index = -1;
  	  let start = 0;
  	  let lastIndex = 0;
  	  let isBrace = false;
  	  let isBracket = false;
  	  let isGlob = false;
  	  let isExtglob = false;
  	  let isGlobstar = false;
  	  let braceEscaped = false;
  	  let backslashes = false;
  	  let negated = false;
  	  let negatedExtglob = false;
  	  let finished = false;
  	  let braces = 0;
  	  let prev;
  	  let code;
  	  let token = { value: '', depth: 0, isGlob: false };

  	  const eos = () => index >= length;
  	  const peek = () => str.charCodeAt(index + 1);
  	  const advance = () => {
  	    prev = code;
  	    return str.charCodeAt(++index);
  	  };

  	  while (index < length) {
  	    code = advance();
  	    let next;

  	    if (code === CHAR_BACKWARD_SLASH) {
  	      backslashes = token.backslashes = true;
  	      code = advance();

  	      if (code === CHAR_LEFT_CURLY_BRACE) {
  	        braceEscaped = true;
  	      }
  	      continue;
  	    }

  	    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
  	      braces++;

  	      while (eos() !== true && (code = advance())) {
  	        if (code === CHAR_BACKWARD_SLASH) {
  	          backslashes = token.backslashes = true;
  	          advance();
  	          continue;
  	        }

  	        if (code === CHAR_LEFT_CURLY_BRACE) {
  	          braces++;
  	          continue;
  	        }

  	        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
  	          isBrace = token.isBrace = true;
  	          isGlob = token.isGlob = true;
  	          finished = true;

  	          if (scanToEnd === true) {
  	            continue;
  	          }

  	          break;
  	        }

  	        if (braceEscaped !== true && code === CHAR_COMMA) {
  	          isBrace = token.isBrace = true;
  	          isGlob = token.isGlob = true;
  	          finished = true;

  	          if (scanToEnd === true) {
  	            continue;
  	          }

  	          break;
  	        }

  	        if (code === CHAR_RIGHT_CURLY_BRACE) {
  	          braces--;

  	          if (braces === 0) {
  	            braceEscaped = false;
  	            isBrace = token.isBrace = true;
  	            finished = true;
  	            break;
  	          }
  	        }
  	      }

  	      if (scanToEnd === true) {
  	        continue;
  	      }

  	      break;
  	    }

  	    if (code === CHAR_FORWARD_SLASH) {
  	      slashes.push(index);
  	      tokens.push(token);
  	      token = { value: '', depth: 0, isGlob: false };

  	      if (finished === true) continue;
  	      if (prev === CHAR_DOT && index === (start + 1)) {
  	        start += 2;
  	        continue;
  	      }

  	      lastIndex = index + 1;
  	      continue;
  	    }

  	    if (opts.noext !== true) {
  	      const isExtglobChar = code === CHAR_PLUS
  	        || code === CHAR_AT
  	        || code === CHAR_ASTERISK
  	        || code === CHAR_QUESTION_MARK
  	        || code === CHAR_EXCLAMATION_MARK;

  	      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
  	        isGlob = token.isGlob = true;
  	        isExtglob = token.isExtglob = true;
  	        finished = true;
  	        if (code === CHAR_EXCLAMATION_MARK && index === start) {
  	          negatedExtglob = true;
  	        }

  	        if (scanToEnd === true) {
  	          while (eos() !== true && (code = advance())) {
  	            if (code === CHAR_BACKWARD_SLASH) {
  	              backslashes = token.backslashes = true;
  	              code = advance();
  	              continue;
  	            }

  	            if (code === CHAR_RIGHT_PARENTHESES) {
  	              isGlob = token.isGlob = true;
  	              finished = true;
  	              break;
  	            }
  	          }
  	          continue;
  	        }
  	        break;
  	      }
  	    }

  	    if (code === CHAR_ASTERISK) {
  	      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
  	      isGlob = token.isGlob = true;
  	      finished = true;

  	      if (scanToEnd === true) {
  	        continue;
  	      }
  	      break;
  	    }

  	    if (code === CHAR_QUESTION_MARK) {
  	      isGlob = token.isGlob = true;
  	      finished = true;

  	      if (scanToEnd === true) {
  	        continue;
  	      }
  	      break;
  	    }

  	    if (code === CHAR_LEFT_SQUARE_BRACKET) {
  	      while (eos() !== true && (next = advance())) {
  	        if (next === CHAR_BACKWARD_SLASH) {
  	          backslashes = token.backslashes = true;
  	          advance();
  	          continue;
  	        }

  	        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
  	          isBracket = token.isBracket = true;
  	          isGlob = token.isGlob = true;
  	          finished = true;
  	          break;
  	        }
  	      }

  	      if (scanToEnd === true) {
  	        continue;
  	      }

  	      break;
  	    }

  	    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
  	      negated = token.negated = true;
  	      start++;
  	      continue;
  	    }

  	    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
  	      isGlob = token.isGlob = true;

  	      if (scanToEnd === true) {
  	        while (eos() !== true && (code = advance())) {
  	          if (code === CHAR_LEFT_PARENTHESES) {
  	            backslashes = token.backslashes = true;
  	            code = advance();
  	            continue;
  	          }

  	          if (code === CHAR_RIGHT_PARENTHESES) {
  	            finished = true;
  	            break;
  	          }
  	        }
  	        continue;
  	      }
  	      break;
  	    }

  	    if (isGlob === true) {
  	      finished = true;

  	      if (scanToEnd === true) {
  	        continue;
  	      }

  	      break;
  	    }
  	  }

  	  if (opts.noext === true) {
  	    isExtglob = false;
  	    isGlob = false;
  	  }

  	  let base = str;
  	  let prefix = '';
  	  let glob = '';

  	  if (start > 0) {
  	    prefix = str.slice(0, start);
  	    str = str.slice(start);
  	    lastIndex -= start;
  	  }

  	  if (base && isGlob === true && lastIndex > 0) {
  	    base = str.slice(0, lastIndex);
  	    glob = str.slice(lastIndex);
  	  } else if (isGlob === true) {
  	    base = '';
  	    glob = str;
  	  } else {
  	    base = str;
  	  }

  	  if (base && base !== '' && base !== '/' && base !== str) {
  	    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
  	      base = base.slice(0, -1);
  	    }
  	  }

  	  if (opts.unescape === true) {
  	    if (glob) glob = utils.removeBackslashes(glob);

  	    if (base && backslashes === true) {
  	      base = utils.removeBackslashes(base);
  	    }
  	  }

  	  const state = {
  	    prefix,
  	    input,
  	    start,
  	    base,
  	    glob,
  	    isBrace,
  	    isBracket,
  	    isGlob,
  	    isExtglob,
  	    isGlobstar,
  	    negated,
  	    negatedExtglob
  	  };

  	  if (opts.tokens === true) {
  	    state.maxDepth = 0;
  	    if (!isPathSeparator(code)) {
  	      tokens.push(token);
  	    }
  	    state.tokens = tokens;
  	  }

  	  if (opts.parts === true || opts.tokens === true) {
  	    let prevIndex;

  	    for (let idx = 0; idx < slashes.length; idx++) {
  	      const n = prevIndex ? prevIndex + 1 : start;
  	      const i = slashes[idx];
  	      const value = input.slice(n, i);
  	      if (opts.tokens) {
  	        if (idx === 0 && start !== 0) {
  	          tokens[idx].isPrefix = true;
  	          tokens[idx].value = prefix;
  	        } else {
  	          tokens[idx].value = value;
  	        }
  	        depth(tokens[idx]);
  	        state.maxDepth += tokens[idx].depth;
  	      }
  	      if (idx !== 0 || value !== '') {
  	        parts.push(value);
  	      }
  	      prevIndex = i;
  	    }

  	    if (prevIndex && prevIndex + 1 < input.length) {
  	      const value = input.slice(prevIndex + 1);
  	      parts.push(value);

  	      if (opts.tokens) {
  	        tokens[tokens.length - 1].value = value;
  	        depth(tokens[tokens.length - 1]);
  	        state.maxDepth += tokens[tokens.length - 1].depth;
  	      }
  	    }

  	    state.slashes = slashes;
  	    state.parts = parts;
  	  }

  	  return state;
  	};

  	scan_1 = scan;
  	return scan_1;
  }

  var parse_1;
  var hasRequiredParse;

  function requireParse () {
  	if (hasRequiredParse) return parse_1;
  	hasRequiredParse = 1;

  	const constants = /*@__PURE__*/ requireConstants();
  	const utils = /*@__PURE__*/ requireUtils();

  	/**
  	 * Constants
  	 */

  	const {
  	  MAX_LENGTH,
  	  POSIX_REGEX_SOURCE,
  	  REGEX_NON_SPECIAL_CHARS,
  	  REGEX_SPECIAL_CHARS_BACKREF,
  	  REPLACEMENTS
  	} = constants;

  	/**
  	 * Helpers
  	 */

  	const expandRange = (args, options) => {
  	  if (typeof options.expandRange === 'function') {
  	    return options.expandRange(...args, options);
  	  }

  	  args.sort();
  	  const value = `[${args.join('-')}]`;

  	  try {
  	    /* eslint-disable-next-line no-new */
  	    new RegExp(value);
  	  } catch (ex) {
  	    return args.map(v => utils.escapeRegex(v)).join('..');
  	  }

  	  return value;
  	};

  	/**
  	 * Create the message for a syntax error
  	 */

  	const syntaxError = (type, char) => {
  	  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
  	};

  	/**
  	 * Parse the given input string.
  	 * @param {String} input
  	 * @param {Object} options
  	 * @return {Object}
  	 */

  	const parse = (input, options) => {
  	  if (typeof input !== 'string') {
  	    throw new TypeError('Expected a string');
  	  }

  	  input = REPLACEMENTS[input] || input;

  	  const opts = { ...options };
  	  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  	  let len = input.length;
  	  if (len > max) {
  	    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  	  }

  	  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  	  const tokens = [bos];

  	  const capture = opts.capture ? '' : '?:';

  	  // create constants based on platform, for windows or posix
  	  const PLATFORM_CHARS = constants.globChars(opts.windows);
  	  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  	  const {
  	    DOT_LITERAL,
  	    PLUS_LITERAL,
  	    SLASH_LITERAL,
  	    ONE_CHAR,
  	    DOTS_SLASH,
  	    NO_DOT,
  	    NO_DOT_SLASH,
  	    NO_DOTS_SLASH,
  	    QMARK,
  	    QMARK_NO_DOT,
  	    STAR,
  	    START_ANCHOR
  	  } = PLATFORM_CHARS;

  	  const globstar = opts => {
  	    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  	  };

  	  const nodot = opts.dot ? '' : NO_DOT;
  	  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  	  let star = opts.bash === true ? globstar(opts) : STAR;

  	  if (opts.capture) {
  	    star = `(${star})`;
  	  }

  	  // minimatch options support
  	  if (typeof opts.noext === 'boolean') {
  	    opts.noextglob = opts.noext;
  	  }

  	  const state = {
  	    input,
  	    index: -1,
  	    start: 0,
  	    dot: opts.dot === true,
  	    consumed: '',
  	    output: '',
  	    prefix: '',
  	    backtrack: false,
  	    negated: false,
  	    brackets: 0,
  	    braces: 0,
  	    parens: 0,
  	    quotes: 0,
  	    globstar: false,
  	    tokens
  	  };

  	  input = utils.removePrefix(input, state);
  	  len = input.length;

  	  const extglobs = [];
  	  const braces = [];
  	  const stack = [];
  	  let prev = bos;
  	  let value;

  	  /**
  	   * Tokenizing helpers
  	   */

  	  const eos = () => state.index === len - 1;
  	  const peek = state.peek = (n = 1) => input[state.index + n];
  	  const advance = state.advance = () => input[++state.index] || '';
  	  const remaining = () => input.slice(state.index + 1);
  	  const consume = (value = '', num = 0) => {
  	    state.consumed += value;
  	    state.index += num;
  	  };

  	  const append = token => {
  	    state.output += token.output != null ? token.output : token.value;
  	    consume(token.value);
  	  };

  	  const negate = () => {
  	    let count = 1;

  	    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
  	      advance();
  	      state.start++;
  	      count++;
  	    }

  	    if (count % 2 === 0) {
  	      return false;
  	    }

  	    state.negated = true;
  	    state.start++;
  	    return true;
  	  };

  	  const increment = type => {
  	    state[type]++;
  	    stack.push(type);
  	  };

  	  const decrement = type => {
  	    state[type]--;
  	    stack.pop();
  	  };

  	  /**
  	   * Push tokens onto the tokens array. This helper speeds up
  	   * tokenizing by 1) helping us avoid backtracking as much as possible,
  	   * and 2) helping us avoid creating extra tokens when consecutive
  	   * characters are plain text. This improves performance and simplifies
  	   * lookbehinds.
  	   */

  	  const push = tok => {
  	    if (prev.type === 'globstar') {
  	      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
  	      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

  	      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
  	        state.output = state.output.slice(0, -prev.output.length);
  	        prev.type = 'star';
  	        prev.value = '*';
  	        prev.output = star;
  	        state.output += prev.output;
  	      }
  	    }

  	    if (extglobs.length && tok.type !== 'paren') {
  	      extglobs[extglobs.length - 1].inner += tok.value;
  	    }

  	    if (tok.value || tok.output) append(tok);
  	    if (prev && prev.type === 'text' && tok.type === 'text') {
  	      prev.output = (prev.output || prev.value) + tok.value;
  	      prev.value += tok.value;
  	      return;
  	    }

  	    tok.prev = prev;
  	    tokens.push(tok);
  	    prev = tok;
  	  };

  	  const extglobOpen = (type, value) => {
  	    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

  	    token.prev = prev;
  	    token.parens = state.parens;
  	    token.output = state.output;
  	    const output = (opts.capture ? '(' : '') + token.open;

  	    increment('parens');
  	    push({ type, value, output: state.output ? '' : ONE_CHAR });
  	    push({ type: 'paren', extglob: true, value: advance(), output });
  	    extglobs.push(token);
  	  };

  	  const extglobClose = token => {
  	    let output = token.close + (opts.capture ? ')' : '');
  	    let rest;

  	    if (token.type === 'negate') {
  	      let extglobStar = star;

  	      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
  	        extglobStar = globstar(opts);
  	      }

  	      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
  	        output = token.close = `)$))${extglobStar}`;
  	      }

  	      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
  	        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
  	        // In this case, we need to parse the string and use it in the output of the original pattern.
  	        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
  	        //
  	        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
  	        const expression = parse(rest, { ...options, fastpaths: false }).output;

  	        output = token.close = `)${expression})${extglobStar})`;
  	      }

  	      if (token.prev.type === 'bos') {
  	        state.negatedExtglob = true;
  	      }
  	    }

  	    push({ type: 'paren', extglob: true, value, output });
  	    decrement('parens');
  	  };

  	  /**
  	   * Fast paths
  	   */

  	  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
  	    let backslashes = false;

  	    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
  	      if (first === '\\') {
  	        backslashes = true;
  	        return m;
  	      }

  	      if (first === '?') {
  	        if (esc) {
  	          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
  	        }
  	        if (index === 0) {
  	          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
  	        }
  	        return QMARK.repeat(chars.length);
  	      }

  	      if (first === '.') {
  	        return DOT_LITERAL.repeat(chars.length);
  	      }

  	      if (first === '*') {
  	        if (esc) {
  	          return esc + first + (rest ? star : '');
  	        }
  	        return star;
  	      }
  	      return esc ? m : `\\${m}`;
  	    });

  	    if (backslashes === true) {
  	      if (opts.unescape === true) {
  	        output = output.replace(/\\/g, '');
  	      } else {
  	        output = output.replace(/\\+/g, m => {
  	          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
  	        });
  	      }
  	    }

  	    if (output === input && opts.contains === true) {
  	      state.output = input;
  	      return state;
  	    }

  	    state.output = utils.wrapOutput(output, state, options);
  	    return state;
  	  }

  	  /**
  	   * Tokenize input until we reach end-of-string
  	   */

  	  while (!eos()) {
  	    value = advance();

  	    if (value === '\u0000') {
  	      continue;
  	    }

  	    /**
  	     * Escaped characters
  	     */

  	    if (value === '\\') {
  	      const next = peek();

  	      if (next === '/' && opts.bash !== true) {
  	        continue;
  	      }

  	      if (next === '.' || next === ';') {
  	        continue;
  	      }

  	      if (!next) {
  	        value += '\\';
  	        push({ type: 'text', value });
  	        continue;
  	      }

  	      // collapse slashes to reduce potential for exploits
  	      const match = /^\\+/.exec(remaining());
  	      let slashes = 0;

  	      if (match && match[0].length > 2) {
  	        slashes = match[0].length;
  	        state.index += slashes;
  	        if (slashes % 2 !== 0) {
  	          value += '\\';
  	        }
  	      }

  	      if (opts.unescape === true) {
  	        value = advance();
  	      } else {
  	        value += advance();
  	      }

  	      if (state.brackets === 0) {
  	        push({ type: 'text', value });
  	        continue;
  	      }
  	    }

  	    /**
  	     * If we're inside a regex character class, continue
  	     * until we reach the closing bracket.
  	     */

  	    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
  	      if (opts.posix !== false && value === ':') {
  	        const inner = prev.value.slice(1);
  	        if (inner.includes('[')) {
  	          prev.posix = true;

  	          if (inner.includes(':')) {
  	            const idx = prev.value.lastIndexOf('[');
  	            const pre = prev.value.slice(0, idx);
  	            const rest = prev.value.slice(idx + 2);
  	            const posix = POSIX_REGEX_SOURCE[rest];
  	            if (posix) {
  	              prev.value = pre + posix;
  	              state.backtrack = true;
  	              advance();

  	              if (!bos.output && tokens.indexOf(prev) === 1) {
  	                bos.output = ONE_CHAR;
  	              }
  	              continue;
  	            }
  	          }
  	        }
  	      }

  	      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
  	        value = `\\${value}`;
  	      }

  	      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
  	        value = `\\${value}`;
  	      }

  	      if (opts.posix === true && value === '!' && prev.value === '[') {
  	        value = '^';
  	      }

  	      prev.value += value;
  	      append({ value });
  	      continue;
  	    }

  	    /**
  	     * If we're inside a quoted string, continue
  	     * until we reach the closing double quote.
  	     */

  	    if (state.quotes === 1 && value !== '"') {
  	      value = utils.escapeRegex(value);
  	      prev.value += value;
  	      append({ value });
  	      continue;
  	    }

  	    /**
  	     * Double quotes
  	     */

  	    if (value === '"') {
  	      state.quotes = state.quotes === 1 ? 0 : 1;
  	      if (opts.keepQuotes === true) {
  	        push({ type: 'text', value });
  	      }
  	      continue;
  	    }

  	    /**
  	     * Parentheses
  	     */

  	    if (value === '(') {
  	      increment('parens');
  	      push({ type: 'paren', value });
  	      continue;
  	    }

  	    if (value === ')') {
  	      if (state.parens === 0 && opts.strictBrackets === true) {
  	        throw new SyntaxError(syntaxError('opening', '('));
  	      }

  	      const extglob = extglobs[extglobs.length - 1];
  	      if (extglob && state.parens === extglob.parens + 1) {
  	        extglobClose(extglobs.pop());
  	        continue;
  	      }

  	      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
  	      decrement('parens');
  	      continue;
  	    }

  	    /**
  	     * Square brackets
  	     */

  	    if (value === '[') {
  	      if (opts.nobracket === true || !remaining().includes(']')) {
  	        if (opts.nobracket !== true && opts.strictBrackets === true) {
  	          throw new SyntaxError(syntaxError('closing', ']'));
  	        }

  	        value = `\\${value}`;
  	      } else {
  	        increment('brackets');
  	      }

  	      push({ type: 'bracket', value });
  	      continue;
  	    }

  	    if (value === ']') {
  	      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
  	        push({ type: 'text', value, output: `\\${value}` });
  	        continue;
  	      }

  	      if (state.brackets === 0) {
  	        if (opts.strictBrackets === true) {
  	          throw new SyntaxError(syntaxError('opening', '['));
  	        }

  	        push({ type: 'text', value, output: `\\${value}` });
  	        continue;
  	      }

  	      decrement('brackets');

  	      const prevValue = prev.value.slice(1);
  	      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
  	        value = `/${value}`;
  	      }

  	      prev.value += value;
  	      append({ value });

  	      // when literal brackets are explicitly disabled
  	      // assume we should match with a regex character class
  	      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
  	        continue;
  	      }

  	      const escaped = utils.escapeRegex(prev.value);
  	      state.output = state.output.slice(0, -prev.value.length);

  	      // when literal brackets are explicitly enabled
  	      // assume we should escape the brackets to match literal characters
  	      if (opts.literalBrackets === true) {
  	        state.output += escaped;
  	        prev.value = escaped;
  	        continue;
  	      }

  	      // when the user specifies nothing, try to match both
  	      prev.value = `(${capture}${escaped}|${prev.value})`;
  	      state.output += prev.value;
  	      continue;
  	    }

  	    /**
  	     * Braces
  	     */

  	    if (value === '{' && opts.nobrace !== true) {
  	      increment('braces');

  	      const open = {
  	        type: 'brace',
  	        value,
  	        output: '(',
  	        outputIndex: state.output.length,
  	        tokensIndex: state.tokens.length
  	      };

  	      braces.push(open);
  	      push(open);
  	      continue;
  	    }

  	    if (value === '}') {
  	      const brace = braces[braces.length - 1];

  	      if (opts.nobrace === true || !brace) {
  	        push({ type: 'text', value, output: value });
  	        continue;
  	      }

  	      let output = ')';

  	      if (brace.dots === true) {
  	        const arr = tokens.slice();
  	        const range = [];

  	        for (let i = arr.length - 1; i >= 0; i--) {
  	          tokens.pop();
  	          if (arr[i].type === 'brace') {
  	            break;
  	          }
  	          if (arr[i].type !== 'dots') {
  	            range.unshift(arr[i].value);
  	          }
  	        }

  	        output = expandRange(range, opts);
  	        state.backtrack = true;
  	      }

  	      if (brace.comma !== true && brace.dots !== true) {
  	        const out = state.output.slice(0, brace.outputIndex);
  	        const toks = state.tokens.slice(brace.tokensIndex);
  	        brace.value = brace.output = '\\{';
  	        value = output = '\\}';
  	        state.output = out;
  	        for (const t of toks) {
  	          state.output += (t.output || t.value);
  	        }
  	      }

  	      push({ type: 'brace', value, output });
  	      decrement('braces');
  	      braces.pop();
  	      continue;
  	    }

  	    /**
  	     * Pipes
  	     */

  	    if (value === '|') {
  	      if (extglobs.length > 0) {
  	        extglobs[extglobs.length - 1].conditions++;
  	      }
  	      push({ type: 'text', value });
  	      continue;
  	    }

  	    /**
  	     * Commas
  	     */

  	    if (value === ',') {
  	      let output = value;

  	      const brace = braces[braces.length - 1];
  	      if (brace && stack[stack.length - 1] === 'braces') {
  	        brace.comma = true;
  	        output = '|';
  	      }

  	      push({ type: 'comma', value, output });
  	      continue;
  	    }

  	    /**
  	     * Slashes
  	     */

  	    if (value === '/') {
  	      // if the beginning of the glob is "./", advance the start
  	      // to the current index, and don't add the "./" characters
  	      // to the state. This greatly simplifies lookbehinds when
  	      // checking for BOS characters like "!" and "." (not "./")
  	      if (prev.type === 'dot' && state.index === state.start + 1) {
  	        state.start = state.index + 1;
  	        state.consumed = '';
  	        state.output = '';
  	        tokens.pop();
  	        prev = bos; // reset "prev" to the first token
  	        continue;
  	      }

  	      push({ type: 'slash', value, output: SLASH_LITERAL });
  	      continue;
  	    }

  	    /**
  	     * Dots
  	     */

  	    if (value === '.') {
  	      if (state.braces > 0 && prev.type === 'dot') {
  	        if (prev.value === '.') prev.output = DOT_LITERAL;
  	        const brace = braces[braces.length - 1];
  	        prev.type = 'dots';
  	        prev.output += value;
  	        prev.value += value;
  	        brace.dots = true;
  	        continue;
  	      }

  	      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
  	        push({ type: 'text', value, output: DOT_LITERAL });
  	        continue;
  	      }

  	      push({ type: 'dot', value, output: DOT_LITERAL });
  	      continue;
  	    }

  	    /**
  	     * Question marks
  	     */

  	    if (value === '?') {
  	      const isGroup = prev && prev.value === '(';
  	      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
  	        extglobOpen('qmark', value);
  	        continue;
  	      }

  	      if (prev && prev.type === 'paren') {
  	        const next = peek();
  	        let output = value;

  	        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
  	          output = `\\${value}`;
  	        }

  	        push({ type: 'text', value, output });
  	        continue;
  	      }

  	      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
  	        push({ type: 'qmark', value, output: QMARK_NO_DOT });
  	        continue;
  	      }

  	      push({ type: 'qmark', value, output: QMARK });
  	      continue;
  	    }

  	    /**
  	     * Exclamation
  	     */

  	    if (value === '!') {
  	      if (opts.noextglob !== true && peek() === '(') {
  	        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
  	          extglobOpen('negate', value);
  	          continue;
  	        }
  	      }

  	      if (opts.nonegate !== true && state.index === 0) {
  	        negate();
  	        continue;
  	      }
  	    }

  	    /**
  	     * Plus
  	     */

  	    if (value === '+') {
  	      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
  	        extglobOpen('plus', value);
  	        continue;
  	      }

  	      if ((prev && prev.value === '(') || opts.regex === false) {
  	        push({ type: 'plus', value, output: PLUS_LITERAL });
  	        continue;
  	      }

  	      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
  	        push({ type: 'plus', value });
  	        continue;
  	      }

  	      push({ type: 'plus', value: PLUS_LITERAL });
  	      continue;
  	    }

  	    /**
  	     * Plain text
  	     */

  	    if (value === '@') {
  	      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
  	        push({ type: 'at', extglob: true, value, output: '' });
  	        continue;
  	      }

  	      push({ type: 'text', value });
  	      continue;
  	    }

  	    /**
  	     * Plain text
  	     */

  	    if (value !== '*') {
  	      if (value === '$' || value === '^') {
  	        value = `\\${value}`;
  	      }

  	      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
  	      if (match) {
  	        value += match[0];
  	        state.index += match[0].length;
  	      }

  	      push({ type: 'text', value });
  	      continue;
  	    }

  	    /**
  	     * Stars
  	     */

  	    if (prev && (prev.type === 'globstar' || prev.star === true)) {
  	      prev.type = 'star';
  	      prev.star = true;
  	      prev.value += value;
  	      prev.output = star;
  	      state.backtrack = true;
  	      state.globstar = true;
  	      consume(value);
  	      continue;
  	    }

  	    let rest = remaining();
  	    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
  	      extglobOpen('star', value);
  	      continue;
  	    }

  	    if (prev.type === 'star') {
  	      if (opts.noglobstar === true) {
  	        consume(value);
  	        continue;
  	      }

  	      const prior = prev.prev;
  	      const before = prior.prev;
  	      const isStart = prior.type === 'slash' || prior.type === 'bos';
  	      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

  	      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
  	        push({ type: 'star', value, output: '' });
  	        continue;
  	      }

  	      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
  	      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
  	      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
  	        push({ type: 'star', value, output: '' });
  	        continue;
  	      }

  	      // strip consecutive `/**/`
  	      while (rest.slice(0, 3) === '/**') {
  	        const after = input[state.index + 4];
  	        if (after && after !== '/') {
  	          break;
  	        }
  	        rest = rest.slice(3);
  	        consume('/**', 3);
  	      }

  	      if (prior.type === 'bos' && eos()) {
  	        prev.type = 'globstar';
  	        prev.value += value;
  	        prev.output = globstar(opts);
  	        state.output = prev.output;
  	        state.globstar = true;
  	        consume(value);
  	        continue;
  	      }

  	      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
  	        state.output = state.output.slice(0, -(prior.output + prev.output).length);
  	        prior.output = `(?:${prior.output}`;

  	        prev.type = 'globstar';
  	        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
  	        prev.value += value;
  	        state.globstar = true;
  	        state.output += prior.output + prev.output;
  	        consume(value);
  	        continue;
  	      }

  	      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
  	        const end = rest[1] !== void 0 ? '|$' : '';

  	        state.output = state.output.slice(0, -(prior.output + prev.output).length);
  	        prior.output = `(?:${prior.output}`;

  	        prev.type = 'globstar';
  	        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
  	        prev.value += value;

  	        state.output += prior.output + prev.output;
  	        state.globstar = true;

  	        consume(value + advance());

  	        push({ type: 'slash', value: '/', output: '' });
  	        continue;
  	      }

  	      if (prior.type === 'bos' && rest[0] === '/') {
  	        prev.type = 'globstar';
  	        prev.value += value;
  	        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
  	        state.output = prev.output;
  	        state.globstar = true;
  	        consume(value + advance());
  	        push({ type: 'slash', value: '/', output: '' });
  	        continue;
  	      }

  	      // remove single star from output
  	      state.output = state.output.slice(0, -prev.output.length);

  	      // reset previous token to globstar
  	      prev.type = 'globstar';
  	      prev.output = globstar(opts);
  	      prev.value += value;

  	      // reset output with globstar
  	      state.output += prev.output;
  	      state.globstar = true;
  	      consume(value);
  	      continue;
  	    }

  	    const token = { type: 'star', value, output: star };

  	    if (opts.bash === true) {
  	      token.output = '.*?';
  	      if (prev.type === 'bos' || prev.type === 'slash') {
  	        token.output = nodot + token.output;
  	      }
  	      push(token);
  	      continue;
  	    }

  	    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
  	      token.output = value;
  	      push(token);
  	      continue;
  	    }

  	    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
  	      if (prev.type === 'dot') {
  	        state.output += NO_DOT_SLASH;
  	        prev.output += NO_DOT_SLASH;

  	      } else if (opts.dot === true) {
  	        state.output += NO_DOTS_SLASH;
  	        prev.output += NO_DOTS_SLASH;

  	      } else {
  	        state.output += nodot;
  	        prev.output += nodot;
  	      }

  	      if (peek() !== '*') {
  	        state.output += ONE_CHAR;
  	        prev.output += ONE_CHAR;
  	      }
  	    }

  	    push(token);
  	  }

  	  while (state.brackets > 0) {
  	    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
  	    state.output = utils.escapeLast(state.output, '[');
  	    decrement('brackets');
  	  }

  	  while (state.parens > 0) {
  	    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
  	    state.output = utils.escapeLast(state.output, '(');
  	    decrement('parens');
  	  }

  	  while (state.braces > 0) {
  	    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
  	    state.output = utils.escapeLast(state.output, '{');
  	    decrement('braces');
  	  }

  	  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
  	    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  	  }

  	  // rebuild the output if we had to backtrack at any point
  	  if (state.backtrack === true) {
  	    state.output = '';

  	    for (const token of state.tokens) {
  	      state.output += token.output != null ? token.output : token.value;

  	      if (token.suffix) {
  	        state.output += token.suffix;
  	      }
  	    }
  	  }

  	  return state;
  	};

  	/**
  	 * Fast paths for creating regular expressions for common glob patterns.
  	 * This can significantly speed up processing and has very little downside
  	 * impact when none of the fast paths match.
  	 */

  	parse.fastpaths = (input, options) => {
  	  const opts = { ...options };
  	  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  	  const len = input.length;
  	  if (len > max) {
  	    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  	  }

  	  input = REPLACEMENTS[input] || input;

  	  // create constants based on platform, for windows or posix
  	  const {
  	    DOT_LITERAL,
  	    SLASH_LITERAL,
  	    ONE_CHAR,
  	    DOTS_SLASH,
  	    NO_DOT,
  	    NO_DOTS,
  	    NO_DOTS_SLASH,
  	    STAR,
  	    START_ANCHOR
  	  } = constants.globChars(opts.windows);

  	  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  	  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  	  const capture = opts.capture ? '' : '?:';
  	  const state = { negated: false, prefix: '' };
  	  let star = opts.bash === true ? '.*?' : STAR;

  	  if (opts.capture) {
  	    star = `(${star})`;
  	  }

  	  const globstar = opts => {
  	    if (opts.noglobstar === true) return star;
  	    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  	  };

  	  const create = str => {
  	    switch (str) {
  	      case '*':
  	        return `${nodot}${ONE_CHAR}${star}`;

  	      case '.*':
  	        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

  	      case '*.*':
  	        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

  	      case '*/*':
  	        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

  	      case '**':
  	        return nodot + globstar(opts);

  	      case '**/*':
  	        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

  	      case '**/*.*':
  	        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

  	      case '**/.*':
  	        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

  	      default: {
  	        const match = /^(.*?)\.(\w+)$/.exec(str);
  	        if (!match) return;

  	        const source = create(match[1]);
  	        if (!source) return;

  	        return source + DOT_LITERAL + match[2];
  	      }
  	    }
  	  };

  	  const output = utils.removePrefix(input, state);
  	  let source = create(output);

  	  if (source && opts.strictSlashes !== true) {
  	    source += `${SLASH_LITERAL}?`;
  	  }

  	  return source;
  	};

  	parse_1 = parse;
  	return parse_1;
  }

  var picomatch_1;
  var hasRequiredPicomatch;

  function requirePicomatch () {
  	if (hasRequiredPicomatch) return picomatch_1;
  	hasRequiredPicomatch = 1;

  	const scan = /*@__PURE__*/ requireScan();
  	const parse = /*@__PURE__*/ requireParse();
  	const utils = /*@__PURE__*/ requireUtils();
  	const constants = /*@__PURE__*/ requireConstants();
  	const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

  	/**
  	 * Creates a matcher function from one or more glob patterns. The
  	 * returned function takes a string to match as its first argument,
  	 * and returns true if the string is a match. The returned matcher
  	 * function also takes a boolean as the second argument that, when true,
  	 * returns an object with additional information.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * // picomatch(glob[, options]);
  	 *
  	 * const isMatch = picomatch('*.!(*a)');
  	 * console.log(isMatch('a.a')); //=> false
  	 * console.log(isMatch('a.b')); //=> true
  	 * ```
  	 * @name picomatch
  	 * @param {String|Array} `globs` One or more glob patterns.
  	 * @param {Object=} `options`
  	 * @return {Function=} Returns a matcher function.
  	 * @api public
  	 */

  	const picomatch = (glob, options, returnState = false) => {
  	  if (Array.isArray(glob)) {
  	    const fns = glob.map(input => picomatch(input, options, returnState));
  	    const arrayMatcher = str => {
  	      for (const isMatch of fns) {
  	        const state = isMatch(str);
  	        if (state) return state;
  	      }
  	      return false;
  	    };
  	    return arrayMatcher;
  	  }

  	  const isState = isObject(glob) && glob.tokens && glob.input;

  	  if (glob === '' || (typeof glob !== 'string' && !isState)) {
  	    throw new TypeError('Expected pattern to be a non-empty string');
  	  }

  	  const opts = options || {};
  	  const posix = opts.windows;
  	  const regex = isState
  	    ? picomatch.compileRe(glob, options)
  	    : picomatch.makeRe(glob, options, false, true);

  	  const state = regex.state;
  	  delete regex.state;

  	  let isIgnored = () => false;
  	  if (opts.ignore) {
  	    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
  	    isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
  	  }

  	  const matcher = (input, returnObject = false) => {
  	    const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
  	    const result = { glob, state, regex, posix, input, output, match, isMatch };

  	    if (typeof opts.onResult === 'function') {
  	      opts.onResult(result);
  	    }

  	    if (isMatch === false) {
  	      result.isMatch = false;
  	      return returnObject ? result : false;
  	    }

  	    if (isIgnored(input)) {
  	      if (typeof opts.onIgnore === 'function') {
  	        opts.onIgnore(result);
  	      }
  	      result.isMatch = false;
  	      return returnObject ? result : false;
  	    }

  	    if (typeof opts.onMatch === 'function') {
  	      opts.onMatch(result);
  	    }
  	    return returnObject ? result : true;
  	  };

  	  if (returnState) {
  	    matcher.state = state;
  	  }

  	  return matcher;
  	};

  	/**
  	 * Test `input` with the given `regex`. This is used by the main
  	 * `picomatch()` function to test the input string.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * // picomatch.test(input, regex[, options]);
  	 *
  	 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
  	 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
  	 * ```
  	 * @param {String} `input` String to test.
  	 * @param {RegExp} `regex`
  	 * @return {Object} Returns an object with matching info.
  	 * @api public
  	 */

  	picomatch.test = (input, regex, options, { glob, posix } = {}) => {
  	  if (typeof input !== 'string') {
  	    throw new TypeError('Expected input to be a string');
  	  }

  	  if (input === '') {
  	    return { isMatch: false, output: '' };
  	  }

  	  const opts = options || {};
  	  const format = opts.format || (posix ? utils.toPosixSlashes : null);
  	  let match = input === glob;
  	  let output = (match && format) ? format(input) : input;

  	  if (match === false) {
  	    output = format ? format(input) : input;
  	    match = output === glob;
  	  }

  	  if (match === false || opts.capture === true) {
  	    if (opts.matchBase === true || opts.basename === true) {
  	      match = picomatch.matchBase(input, regex, options, posix);
  	    } else {
  	      match = regex.exec(output);
  	    }
  	  }

  	  return { isMatch: Boolean(match), match, output };
  	};

  	/**
  	 * Match the basename of a filepath.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * // picomatch.matchBase(input, glob[, options]);
  	 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
  	 * ```
  	 * @param {String} `input` String to test.
  	 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
  	 * @return {Boolean}
  	 * @api public
  	 */

  	picomatch.matchBase = (input, glob, options) => {
  	  const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
  	  return regex.test(utils.basename(input));
  	};

  	/**
  	 * Returns true if **any** of the given glob `patterns` match the specified `string`.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * // picomatch.isMatch(string, patterns[, options]);
  	 *
  	 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
  	 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
  	 * ```
  	 * @param {String|Array} str The string to test.
  	 * @param {String|Array} patterns One or more glob patterns to use for matching.
  	 * @param {Object} [options] See available [options](#options).
  	 * @return {Boolean} Returns true if any patterns match `str`
  	 * @api public
  	 */

  	picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

  	/**
  	 * Parse a glob pattern to create the source string for a regular
  	 * expression.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * const result = picomatch.parse(pattern[, options]);
  	 * ```
  	 * @param {String} `pattern`
  	 * @param {Object} `options`
  	 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
  	 * @api public
  	 */

  	picomatch.parse = (pattern, options) => {
  	  if (Array.isArray(pattern)) return pattern.map(p => picomatch.parse(p, options));
  	  return parse(pattern, { ...options, fastpaths: false });
  	};

  	/**
  	 * Scan a glob pattern to separate the pattern into segments.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * // picomatch.scan(input[, options]);
  	 *
  	 * const result = picomatch.scan('!./foo/*.js');
  	 * console.log(result);
  	 * { prefix: '!./',
  	 *   input: '!./foo/*.js',
  	 *   start: 3,
  	 *   base: 'foo',
  	 *   glob: '*.js',
  	 *   isBrace: false,
  	 *   isBracket: false,
  	 *   isGlob: true,
  	 *   isExtglob: false,
  	 *   isGlobstar: false,
  	 *   negated: true }
  	 * ```
  	 * @param {String} `input` Glob pattern to scan.
  	 * @param {Object} `options`
  	 * @return {Object} Returns an object with
  	 * @api public
  	 */

  	picomatch.scan = (input, options) => scan(input, options);

  	/**
  	 * Compile a regular expression from the `state` object returned by the
  	 * [parse()](#parse) method.
  	 *
  	 * @param {Object} `state`
  	 * @param {Object} `options`
  	 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
  	 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
  	 * @return {RegExp}
  	 * @api public
  	 */

  	picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
  	  if (returnOutput === true) {
  	    return state.output;
  	  }

  	  const opts = options || {};
  	  const prepend = opts.contains ? '' : '^';
  	  const append = opts.contains ? '' : '$';

  	  let source = `${prepend}(?:${state.output})${append}`;
  	  if (state && state.negated === true) {
  	    source = `^(?!${source}).*$`;
  	  }

  	  const regex = picomatch.toRegex(source, options);
  	  if (returnState === true) {
  	    regex.state = state;
  	  }

  	  return regex;
  	};

  	/**
  	 * Create a regular expression from a parsed glob pattern.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * const state = picomatch.parse('*.js');
  	 * // picomatch.compileRe(state[, options]);
  	 *
  	 * console.log(picomatch.compileRe(state));
  	 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
  	 * ```
  	 * @param {String} `state` The object returned from the `.parse` method.
  	 * @param {Object} `options`
  	 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
  	 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
  	 * @return {RegExp} Returns a regex created from the given pattern.
  	 * @api public
  	 */

  	picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  	  if (!input || typeof input !== 'string') {
  	    throw new TypeError('Expected a non-empty string');
  	  }

  	  let parsed = { negated: false, fastpaths: true };

  	  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
  	    parsed.output = parse.fastpaths(input, options);
  	  }

  	  if (!parsed.output) {
  	    parsed = parse(input, options);
  	  }

  	  return picomatch.compileRe(parsed, options, returnOutput, returnState);
  	};

  	/**
  	 * Create a regular expression from the given regex source string.
  	 *
  	 * ```js
  	 * const picomatch = require('picomatch');
  	 * // picomatch.toRegex(source[, options]);
  	 *
  	 * const { output } = picomatch.parse('*.js');
  	 * console.log(picomatch.toRegex(output));
  	 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
  	 * ```
  	 * @param {String} `source` Regular expression source string.
  	 * @param {Object} `options`
  	 * @return {RegExp}
  	 * @api public
  	 */

  	picomatch.toRegex = (source, options) => {
  	  try {
  	    const opts = options || {};
  	    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  	  } catch (err) {
  	    if (options && options.debug === true) throw err;
  	    return /$^/;
  	  }
  	};

  	/**
  	 * Picomatch constants.
  	 * @return {Object}
  	 */

  	picomatch.constants = constants;

  	/**
  	 * Expose "picomatch"
  	 */

  	picomatch_1 = picomatch;
  	return picomatch_1;
  }

  var posix;
  var hasRequiredPosix;

  function requirePosix () {
  	if (hasRequiredPosix) return posix;
  	hasRequiredPosix = 1;

  	posix = /*@__PURE__*/ requirePicomatch();
  	return posix;
  }

  var posixExports = /*@__PURE__*/ requirePosix();
  var picomatch = /*@__PURE__*/getDefaultExportFromCjs(posixExports);

  const parseInputAccept = inputAccept => {
    const extensions = [];
    const mimeTypes = [];
    inputAccept.split(",").map(mimeType => mimeType.trim()).filter(Boolean).forEach(fileType => {
      if (fileType.startsWith(".")) {
        extensions.push(`*${fileType}`);
      } else {
        mimeTypes.push(fileType);
      }
    });
    return [extensions, mimeTypes];
  };
  class AcceptedFileTypes {
    constructor(inputAccept) {
      const [extensions, mimeTypes] = parseInputAccept(inputAccept);
      this.extensions = extensions;
      this.mimeTypes = mimeTypes;
    }
    isAccepted(fileName) {
      if (this.extensions.length === 0 && this.mimeTypes.length === 0) {
        return true;
      }
      return this.isMimeTypeAccepted(mime.getType(fileName)) || this.isExtensionAccepted(fileName);
    }
    isExtensionAccepted(fileName) {
      if (this.extensions.length === 0) {
        return false;
      }
      return picomatch.isMatch(fileName, this.extensions, {
        nocase: true
      });
    }
    isMimeTypeAccepted(mimeType) {
      if (!mimeType || this.mimeTypes.length === 0) {
        return false;
      }
      return picomatch.isMatch(mimeType, this.mimeTypes);
    }
  }

  const getEntriesFromDirectory = async directoryEntry => new Promise((resolve, reject) => {
    directoryEntry.createReader().readEntries(resolve, reject);
  });
  const getFileFromFileSystemFileEntry = async fileEntry => new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject);
  });
  const getFilesFromFileSystemEntries = async entries => {
    const result = [];
    for (const entry of entries) {
      const filesFromEntry = await getFilesFromFileSystemEntry(entry);
      filesFromEntry.forEach(file => result.push(file));
    }
    return result;
  };
  const getFilesFromFileSystemEntry = async entry => {
    const result = [];
    if (entry.isFile) {
      const file = await getFileFromFileSystemFileEntry(entry);
      result.push(file);
    } else if (entry.isDirectory) {
      const entriesFromDirectory = await getEntriesFromDirectory(entry);
      const files = await getFilesFromFileSystemEntries(entriesFromDirectory);
      files.forEach(file => result.push(file));
    }
    return result;
  };
  const getFilesFromDataTransfer = async dataTransfer => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (dataTransfer.items) {
      const files = [];
      for (const item of dataTransfer.items) {
        const fileSystemEntry = item.webkitGetAsEntry();
        if (fileSystemEntry) {
          const filesFromEntry = await getFilesFromFileSystemEntry(fileSystemEntry);
          filesFromEntry.forEach(file => files.push(file));
        } else {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      return files;
    } else {
      // backwards compatibility
      return [...dataTransfer.files];
    }
  };
  class DropArea {
    constructor({
      container,
      inputAccept,
      onUploadFiles,
      renderer
    }) {
      this.container = container;
      this.onUploadFiles = onUploadFiles;
      this.acceptedFileTypes = new AcceptedFileTypes(inputAccept);
      this.renderer = renderer;
      container.addEventListener("dragenter", () => {
        container.classList.add("dff-dropping");
      });
      container.addEventListener("dragleave", () => {
        container.classList.remove("dff-dropping");
      });
      container.addEventListener("dragover", e => {
        container.classList.add("dff-dropping");
        e.preventDefault();
      });
      container.addEventListener("drop", this.onDrop);
    }
    onDrop = e => {
      const dragEvent = e;
      this.container.classList.remove("dff-dropping");
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      const uploadFiles = async () => {
        try {
          if (dragEvent.dataTransfer) {
            const files = await getFilesFromDataTransfer(dragEvent.dataTransfer);
            const acceptedFiles = [];
            const invalidFiles = [];
            for (const file of files) {
              if (this.acceptedFileTypes.isAccepted(file.name)) {
                acceptedFiles.push(file);
              } else {
                invalidFiles.push(file);
              }
            }
            this.renderer.setErrorInvalidFiles(invalidFiles);
            void this.onUploadFiles(acceptedFiles);
          }
        } catch (error) {
          console.error(error);
        }
      };
      void uploadFiles();
    };
  }

  /*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   */

  var escapeHtml_1;
  var hasRequiredEscapeHtml;

  function requireEscapeHtml () {
  	if (hasRequiredEscapeHtml) return escapeHtml_1;
  	hasRequiredEscapeHtml = 1;

  	/**
  	 * Module variables.
  	 * @private
  	 */

  	var matchHtmlRegExp = /["'&<>]/;

  	/**
  	 * Module exports.
  	 * @public
  	 */

  	escapeHtml_1 = escapeHtml;

  	/**
  	 * Escape special characters in the given string of html.
  	 *
  	 * @param  {string} string The string to escape for inserting into HTML
  	 * @return {string}
  	 * @public
  	 */

  	function escapeHtml(string) {
  	  var str = '' + string;
  	  var match = matchHtmlRegExp.exec(str);

  	  if (!match) {
  	    return str;
  	  }

  	  var escape;
  	  var html = '';
  	  var index = 0;
  	  var lastIndex = 0;

  	  for (index = match.index; index < str.length; index++) {
  	    switch (str.charCodeAt(index)) {
  	      case 34: // "
  	        escape = '&quot;';
  	        break;
  	      case 38: // &
  	        escape = '&amp;';
  	        break;
  	      case 39: // '
  	        escape = '&#39;';
  	        break;
  	      case 60: // <
  	        escape = '&lt;';
  	        break;
  	      case 62: // >
  	        escape = '&gt;';
  	        break;
  	      default:
  	        continue;
  	    }

  	    if (lastIndex !== index) {
  	      html += str.substring(lastIndex, index);
  	    }

  	    lastIndex = index + 1;
  	    html += escape;
  	  }

  	  return lastIndex !== index
  	    ? html + str.substring(lastIndex, index)
  	    : html;
  	}
  	return escapeHtml_1;
  }

  var escapeHtmlExports = requireEscapeHtml();
  var escape = /*@__PURE__*/getDefaultExportFromCjs(escapeHtmlExports);

  const formatBytes = (bytes, decimals) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const n = parseFloat((bytes / k ** i).toFixed(dm));
    const size = sizes[i];
    if (size == null) {
      return "";
    } else {
      return `${n.toString()} ${size}`;
    }
  };
  const getInputNameWithPrefix = (fieldName, prefix) => prefix ? `${prefix}-${fieldName}` : fieldName;
  const getInputNameWithoutPrefix = (fieldName, prefix) => prefix ? fieldName.slice(prefix.length + 1) : fieldName;
  const findInput = (form, fieldName, prefix) => {
    const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
    const input = form.querySelector(`[name="${inputNameWithPrefix}"]`);
    if (!input) {
      return null;
    }
    return input;
  };
  const getUploadsFieldName = (fieldName, prefix) => `${getInputNameWithoutPrefix(fieldName, prefix)}-uploads`;
  const getInputValueForFormAndPrefix = (form, fieldName, prefix) => findInput(form, fieldName, prefix)?.value;
  const getMetadataFieldName = (fieldName, prefix) => `${getInputNameWithoutPrefix(fieldName, prefix)}-metadata`;

  class RenderUploadFile {
    constructor({
      input,
      parent,
      skipRequired,
      translations
    }) {
      this.container = this.createFilesContainer(parent);
      this.errors = this.createErrorContainer(parent);
      this.input = input;
      this.translations = translations;
      if (skipRequired) {
        this.input.required = false;
      }
    }
    addNewUpload(filename, uploadIndex) {
      const div = this.addFile(filename, uploadIndex);
      const progressSpan = document.createElement("span");
      progressSpan.className = "dff-progress";
      const innerSpan = document.createElement("span");
      innerSpan.className = "dff-progress-inner";
      progressSpan.appendChild(innerSpan);
      div.appendChild(progressSpan);
      const cancelLink = document.createElement("a");
      cancelLink.className = "dff-cancel";
      this.setTextContent(cancelLink, this.getTranslation("Cancel"));
      cancelLink.setAttribute("data-index", uploadIndex.toString());
      cancelLink.href = "#";
      div.appendChild(cancelLink);
      return div;
    }
    addUploadedFile(filename, uploadIndex, filesize) {
      const element = this.addFile(filename, uploadIndex);
      this.setSuccess(uploadIndex, filesize);
      return element;
    }
    clearInput() {
      const {
        input
      } = this;
      input.value = "";
    }
    deleteFile(index) {
      const div = this.findFileDiv(index);
      if (div) {
        div.remove();
      }
    }
    disableCancel(index) {
      const cancelSpan = this.findCancelSpan(index);
      if (cancelSpan) {
        cancelSpan.classList.add("dff-disabled");
      }
    }
    disableDelete(index) {
      const deleteLink = this.findDeleteLink(index);
      if (deleteLink) {
        deleteLink.classList.add("dff-disabled");
      }
    }
    findFileDiv(index) {
      return this.container.querySelector(`.dff-file-id-${index.toString()}`);
    }
    removeDropHint() {
      const dropHint = this.container.querySelector(".dff-drop-hint");
      if (dropHint) {
        dropHint.remove();
      }
    }
    renderDropHint() {
      if (this.container.querySelector(".dff-drop-hint")) {
        return;
      }
      const dropHint = document.createElement("div");
      dropHint.className = "dff-drop-hint";
      this.setTextContent(dropHint, this.getTranslation("Drop your files here"));
      this.container.appendChild(dropHint);
    }
    setDeleteFailed(index) {
      this.setErrorMessage(index, this.getTranslation("Delete failed"));
      this.enableDelete(index);
    }
    setError(index) {
      this.setErrorMessage(index, this.getTranslation("Upload failed"));
      const el = this.findFileDiv(index);
      if (el) {
        el.classList.add("dff-upload-fail");
      }
      this.removeProgress(index);
      this.removeCancel(index);
    }
    setErrorInvalidFiles(files) {
      const errorsMessages = document.createElement("ul");
      for (const file of files) {
        const msg = document.createElement("li");
        const invalidFileTypeMessage = this.getTranslation("Invalid file type");
        this.setTextContent(msg, `${file.name}: ${invalidFileTypeMessage}`);
        msg.className = "dff-error";
        errorsMessages.appendChild(msg);
      }
      this.errors.replaceChildren(errorsMessages);
      this.clearInput();
    }
    setSuccess(index, size) {
      const el = this.findFileDiv(index);
      if (el) {
        el.classList.add("dff-upload-success");
        if (size != null) {
          const fileSizeInfo = document.createElement("span");
          this.setTextContent(fileSizeInfo, formatBytes(size, 2));
          fileSizeInfo.className = "dff-filesize";
          el.appendChild(fileSizeInfo);
        }
        const deleteLink = document.createElement("a");
        this.setTextContent(deleteLink, this.getTranslation("Delete"));
        deleteLink.className = "dff-delete";
        deleteLink.setAttribute("data-index", index.toString());
        deleteLink.href = "#";
        el.appendChild(deleteLink);
      }
      this.removeProgress(index);
      this.removeCancel(index);
    }
    updateProgress(index, percentage) {
      const el = this.container.querySelector(`.dff-file-id-${index.toString()}`);
      if (el) {
        const innerProgressSpan = el.querySelector(".dff-progress-inner");
        if (innerProgressSpan) {
          innerProgressSpan.style.width = `${percentage}%`;
        }
      }
    }
    addFile(filename, uploadIndex) {
      const div = document.createElement("div");
      div.className = `dff-file dff-file-id-${uploadIndex.toString()}`;
      const nameSpan = document.createElement("span");
      nameSpan.innerHTML = escape(filename);
      nameSpan.className = "dff-filename";
      nameSpan.setAttribute("data-index", uploadIndex.toString());
      div.appendChild(nameSpan);
      this.container.appendChild(div);
      this.input.required = false;
      return div;
    }
    createErrorContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-invalid-files";
      parent.appendChild(div);
      return div;
    };
    createFilesContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-files";
      parent.appendChild(div);
      return div;
    };
    enableDelete(index) {
      const deleteLink = this.findDeleteLink(index);
      if (deleteLink) {
        deleteLink.classList.remove("dff-disabled");
      }
    }
    findCancelSpan(index) {
      const el = this.findFileDiv(index);
      if (!el) {
        return null;
      }
      return el.querySelector(".dff-cancel");
    }
    findDeleteLink(index) {
      const div = this.findFileDiv(index);
      if (!div) {
        return div;
      }
      return div.querySelector(".dff-delete");
    }
    getTranslation(key) {
      return this.translations[key] ?? key;
    }
    removeCancel(index) {
      const cancelSpan = this.findCancelSpan(index);
      if (cancelSpan) {
        cancelSpan.remove();
      }
    }
    removeProgress(index) {
      const el = this.findFileDiv(index);
      if (el) {
        const progressSpan = el.querySelector(".dff-progress");
        if (progressSpan) {
          progressSpan.remove();
        }
      }
    }
    setErrorMessage(index, message) {
      const el = this.findFileDiv(index);
      if (!el) {
        return;
      }
      const originalMessageSpan = el.querySelector(".dff-error");
      if (originalMessageSpan) {
        originalMessageSpan.remove();
      }
      const span = document.createElement("span");
      span.classList.add("dff-error");
      this.setTextContent(span, message);
      el.appendChild(span);
    }
    setTextContent(element, text) {
      element.append(document.createTextNode(text));
    }
  }

  let BaseUpload$1 = class BaseUpload {
    constructor({
      name,
      status,
      type,
      uploadIndex
    }) {
      this.name = name;
      this.status = status;
      this.type = type;
      this.uploadIndex = uploadIndex;
    }
    async abort() {
      //
    }
    async delete() {
      //
    }
  };

  function normalize (strArray) {
    var resultArray = [];
    if (strArray.length === 0) { return ''; }

    if (typeof strArray[0] !== 'string') {
      throw new TypeError('Url must be a string. Received ' + strArray[0]);
    }

    // If the first part is a plain protocol, we combine it with the next part.
    if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
      var first = strArray.shift();
      strArray[0] = first + strArray[0];
    }

    // There must be two or three slashes in the file protocol, two slashes in anything else.
    if (strArray[0].match(/^file:\/\/\//)) {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
    } else {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
    }

    for (var i = 0; i < strArray.length; i++) {
      var component = strArray[i];

      if (typeof component !== 'string') {
        throw new TypeError('Url must be a string. Received ' + component);
      }

      if (component === '') { continue; }

      if (i > 0) {
        // Removing the starting slashes for each component but the first.
        component = component.replace(/^[\/]+/, '');
      }
      if (i < strArray.length - 1) {
        // Removing the ending slashes for each component but the last.
        component = component.replace(/[\/]+$/, '');
      } else {
        // For the last component we will combine multiple slashes to a single one.
        component = component.replace(/[\/]+$/, '/');
      }

      resultArray.push(component);

    }

    var str = resultArray.join('/');
    // Each input component is now separated by a single slash except the possible first plain protocol part.

    // remove trailing slash before parameters or hash
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

    // replace ? in parameters with &
    var parts = str.split('?');
    str = parts.shift() + (parts.length > 0 ? '?': '') + parts.join('&');

    return str;
  }

  function urlJoin() {
    var input;

    if (typeof arguments[0] === 'object') {
      input = arguments[0];
    } else {
      input = [].slice.call(arguments);
    }

    return normalize(input);
  }

  const MB = 1024 * 1024;
  const abortMultipartUpload = ({
    csrfToken,
    endpoint,
    key,
    uploadId
  }) => {
    const filename = encodeURIComponent(key);
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, `?key=${filename}`);
    return fetch(url, {
      headers: headers,
      method: "delete"
    }).then(response => {
      return response.json();
    });
  };
  const completeMultipartUpload = ({
    csrfToken,
    endpoint,
    key,
    parts,
    uploadId
  }) => {
    const filename = encodeURIComponent(key);
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, "complete", `?key=${filename}`);
    return fetch(url, {
      body: JSON.stringify({
        parts: parts
      }),
      headers: headers,
      method: "post"
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const createMultipartUpload = ({
    csrfToken,
    endpoint,
    file,
    s3UploadDir
  }) => {
    const headers = new Headers({
      accept: "application/json",
      "content-type": "application/json",
      "X-CSRFToken": csrfToken
    });
    return fetch(endpoint, {
      body: JSON.stringify({
        contentType: file.type,
        filename: file.name,
        s3UploadDir: s3UploadDir
      }),
      headers: headers,
      method: "post"
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const getChunkSize = file => Math.ceil(file.size / 10000);
  const prepareUploadPart = ({
    csrfToken,
    endpoint,
    key,
    number,
    uploadId
  }) => {
    const filename = encodeURIComponent(key);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadId, number.toString(), `?key=${filename}`);
    return fetch(url, {
      headers: headers,
      method: "get"
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i !== -1) {
      arr.splice(i, 1);
    }
  };

  // The following code is adapted from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
  // which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

  class S3Upload extends BaseUpload$1 {
    constructor({
      csrfToken,
      endpoint,
      file,
      s3UploadDir,
      uploadIndex
    }) {
      super({
        name: file.name,
        status: "uploading",
        type: "s3",
        uploadIndex
      });
      this.csrfToken = csrfToken;
      this.endpoint = endpoint;
      this.file = file;
      this.s3UploadDir = s3UploadDir;
      this.key = null;
      this.uploadId = null;
      this.parts = [];

      // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
      // upload was created already. That also ensures that the sequencing is right
      // (so the `OP` definitely happens if the upload is created).
      //
      // This mostly exists to make `abortUpload` work well: only sending the abort request if
      // the upload was already created, and if the createMultipartUpload request is still in flight,
      // aborting it immediately after it finishes.
      this.createdPromise = Promise.reject(new Error());
      this.chunks = [];
      this.chunkState = [];
      this.uploading = [];
      this.onError = undefined;
      this.onProgress = undefined;
      this.onSuccess = undefined;
      this.initChunks();
      this.createdPromise.catch(() => ({})); // silence uncaught rejection warning
    }
    async abort() {
      this.uploading.slice().forEach(xhr => {
        xhr.abort();
      });
      this.uploading = [];
      await this.createdPromise;
      if (this.key && this.uploadId) {
        await abortMultipartUpload({
          csrfToken: this.csrfToken,
          endpoint: this.endpoint,
          key: this.key,
          uploadId: this.uploadId
        });
      }
    }
    async delete() {
      return Promise.resolve();
    }
    getId() {
      return this.uploadId ?? undefined;
    }
    getInitialFile() {
      return {
        id: this.uploadId ?? "",
        name: this.key ?? "",
        original_name: this.file.name,
        size: this.file.size,
        type: "s3"
      };
    }
    getSize() {
      return this.file.size;
    }
    start() {
      void this.createUpload();
    }
    completeUpload() {
      // Parts may not have completed uploading in sorted order, if limit > 1.
      this.parts.sort((a, b) => a.PartNumber - b.PartNumber);
      if (!this.uploadId || !this.key) {
        return Promise.resolve();
      }
      return completeMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: this.key,
        parts: this.parts,
        uploadId: this.uploadId
      }).then(() => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      }, err => {
        this.handleError(err);
      });
    }
    createUpload() {
      this.createdPromise = createMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        file: this.file,
        s3UploadDir: this.s3UploadDir
      });
      return this.createdPromise.then(result => {
        const valid = typeof result === "object" && result && typeof result.uploadId === "string" && typeof result.key === "string";
        if (!valid) {
          throw new TypeError("AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`.");
        }
        this.key = result.key;
        this.uploadId = result.uploadId;
        this.uploadParts();
      }).catch(err => {
        this.handleError(err);
      });
    }
    handleError(error) {
      if (this.onError) {
        this.onError(error);
      } else {
        throw error;
      }
    }
    initChunks() {
      const chunks = [];
      const desiredChunkSize = getChunkSize(this.file);
      // at least 5MB per request, at most 10k requests
      const minChunkSize = Math.max(5 * MB, Math.ceil(this.file.size / 10000));
      const chunkSize = Math.max(desiredChunkSize, minChunkSize);
      for (let i = 0; i < this.file.size; i += chunkSize) {
        const end = Math.min(this.file.size, i + chunkSize);
        chunks.push(this.file.slice(i, end));
      }
      this.chunks = chunks;
      this.chunkState = chunks.map(() => ({
        busy: false,
        done: false,
        uploaded: 0
      }));
    }
    onPartComplete(index, etag) {
      const state = this.chunkState[index];
      if (state) {
        state.etag = etag;
        state.done = true;
      }
      const part = {
        ETag: etag,
        PartNumber: index + 1
      };
      this.parts.push(part);
      this.uploadParts();
    }
    onPartProgress(index, sent) {
      const state = this.chunkState[index];
      if (state) {
        state.uploaded = sent;
      }
      if (this.onProgress) {
        const totalUploaded = this.chunkState.reduce((n, c) => n + c.uploaded, 0);
        this.onProgress(totalUploaded, this.file.size);
      }
    }
    uploadPart(index) {
      const state = this.chunkState[index];
      if (state) {
        state.busy = true;
      }
      if (!this.key || !this.uploadId) {
        return Promise.resolve();
      }
      return prepareUploadPart({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: this.key,
        number: index + 1,
        uploadId: this.uploadId
      }).then(result => {
        const valid = typeof result === "object" && typeof result.url === "string";
        if (!valid) {
          throw new TypeError("AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`.");
        }
        return result;
      }).then(({
        url
      }) => {
        this.uploadPartBytes(index, url);
      }, err => {
        this.handleError(err);
      });
    }
    uploadPartBytes(index, url) {
      const body = this.chunks[index];
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.responseType = "text";
      this.uploading.push(xhr);
      xhr.upload.addEventListener("progress", ev => {
        if (!ev.lengthComputable) {
          return;
        }
        this.onPartProgress(index, ev.loaded);
      });
      xhr.addEventListener("abort", () => {
        remove(this.uploading, xhr);
        const state = this.chunkState[index];
        if (state) {
          state.busy = false;
        }
      });
      xhr.addEventListener("load", () => {
        remove(this.uploading, xhr);
        const state = this.chunkState[index];
        if (state) {
          state.busy = false;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          this.handleError(new Error("Non 2xx"));
          return;
        }
        this.onPartProgress(index, body?.size ?? 0);

        // NOTE This must be allowed by CORS.
        const etag = xhr.getResponseHeader("ETag");
        if (etag === null) {
          this.handleError(new Error("AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."));
          return;
        }
        this.onPartComplete(index, etag);
      });
      xhr.addEventListener("error", () => {
        remove(this.uploading, xhr);
        const state = this.chunkState[index];
        if (state) {
          state.busy = false;
        }
        const error = new Error("Unknown error");
        this.handleError(error);
      });
      xhr.send(body);
    }
    uploadParts() {
      const need = 1 - this.uploading.length;
      if (need === 0) {
        return;
      }

      // All parts are uploaded.
      if (this.chunkState.every(state => state.done)) {
        void this.completeUpload();
        return;
      }
      const candidates = [];
      for (let i = 0; i < this.chunkState.length; i++) {
        const state = this.chunkState[i];
        if (!state || state.done || state.busy) {
          continue;
        }
        candidates.push(i);
        if (candidates.length >= need) {
          break;
        }
      }
      candidates.forEach(index => {
        void this.uploadPart(index);
      });
    }
  }

  class DetailedError extends Error {
    constructor(message, causingErr = null, req = null, res = null) {
      super(message);
      this.originalRequest = req;
      this.originalResponse = res;
      this.causingError = causingErr;
      if (causingErr != null) {
        message += `, caused by ${causingErr.toString()}`;
      }
      if (req != null) {
        const requestId = req.getHeader('X-Request-ID') || 'n/a';
        const method = req.getMethod();
        const url = req.getURL();
        const status = res ? res.getStatus() : 'n/a';
        const body = res ? res.getBody() || '' : 'n/a';
        message += `, originated from request (method: ${method}, url: ${url}, response code: ${status}, response text: ${body}, request id: ${requestId})`;
      }
      this.message = message;
    }
  }

  function log(msg) {
    return;
  }

  class NoopUrlStorage {
    listAllUploads() {
      return Promise.resolve([]);
    }
    findUploadsByFingerprint(_fingerprint) {
      return Promise.resolve([]);
    }
    removeUpload(_urlStorageKey) {
      return Promise.resolve();
    }
    addUpload(_fingerprint, _upload) {
      return Promise.resolve(null);
    }
  }

  /**
   *  base64.ts
   *
   *  Licensed under the BSD 3-Clause License.
   *    http://opensource.org/licenses/BSD-3-Clause
   *
   *  References:
   *    http://en.wikipedia.org/wiki/Base64
   *
   * @author Dan Kogai (https://github.com/dankogai)
   */
  const version = '3.7.7';
  /**
   * @deprecated use lowercase `version`.
   */
  const VERSION = version;
  const _hasBuffer = typeof Buffer === 'function';
  const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
  const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
  const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const b64chs = Array.prototype.slice.call(b64ch);
  const b64tab = ((a) => {
      let tab = {};
      a.forEach((c, i) => tab[c] = i);
      return tab;
  })(b64chs);
  const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
  const _fromCC = String.fromCharCode.bind(String);
  const _U8Afrom = typeof Uint8Array.from === 'function'
      ? Uint8Array.from.bind(Uint8Array)
      : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
  const _mkUriSafe = (src) => src
      .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
  const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
  /**
   * polyfill version of `btoa`
   */
  const btoaPolyfill = (bin) => {
      // console.log('polyfilled');
      let u32, c0, c1, c2, asc = '';
      const pad = bin.length % 3;
      for (let i = 0; i < bin.length;) {
          if ((c0 = bin.charCodeAt(i++)) > 255 ||
              (c1 = bin.charCodeAt(i++)) > 255 ||
              (c2 = bin.charCodeAt(i++)) > 255)
              throw new TypeError('invalid character found');
          u32 = (c0 << 16) | (c1 << 8) | c2;
          asc += b64chs[u32 >> 18 & 63]
              + b64chs[u32 >> 12 & 63]
              + b64chs[u32 >> 6 & 63]
              + b64chs[u32 & 63];
      }
      return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
  };
  /**
   * does what `window.btoa` of web browsers do.
   * @param {String} bin binary string
   * @returns {string} Base64-encoded string
   */
  const _btoa = typeof btoa === 'function' ? (bin) => btoa(bin)
      : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
          : btoaPolyfill;
  const _fromUint8Array = _hasBuffer
      ? (u8a) => Buffer.from(u8a).toString('base64')
      : (u8a) => {
          // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
          const maxargs = 0x1000;
          let strs = [];
          for (let i = 0, l = u8a.length; i < l; i += maxargs) {
              strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
          }
          return _btoa(strs.join(''));
      };
  /**
   * converts a Uint8Array to a Base64 string.
   * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
   * @returns {string} Base64 string
   */
  const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
  // This trick is found broken https://github.com/dankogai/js-base64/issues/130
  // const utob = (src: string) => unescape(encodeURIComponent(src));
  // reverting good old fationed regexp
  const cb_utob = (c) => {
      if (c.length < 2) {
          var cc = c.charCodeAt(0);
          return cc < 0x80 ? c
              : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
                  + _fromCC(0x80 | (cc & 0x3f)))
                  : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
                      + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                      + _fromCC(0x80 | (cc & 0x3f)));
      }
      else {
          var cc = 0x10000
              + (c.charCodeAt(0) - 0xD800) * 0x400
              + (c.charCodeAt(1) - 0xDC00);
          return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
              + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
              + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
              + _fromCC(0x80 | (cc & 0x3f)));
      }
  };
  const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
  /**
   * @deprecated should have been internal use only.
   * @param {string} src UTF-8 string
   * @returns {string} UTF-16 string
   */
  const utob = (u) => u.replace(re_utob, cb_utob);
  //
  const _encode = _hasBuffer
      ? (s) => Buffer.from(s, 'utf8').toString('base64')
      : _TE
          ? (s) => _fromUint8Array(_TE.encode(s))
          : (s) => _btoa(utob(s));
  /**
   * converts a UTF-8-encoded string to a Base64 string.
   * @param {boolean} [urlsafe] if `true` make the result URL-safe
   * @returns {string} Base64 string
   */
  const encode = (src, urlsafe = false) => urlsafe
      ? _mkUriSafe(_encode(src))
      : _encode(src);
  /**
   * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
   * @returns {string} Base64 string
   */
  const encodeURI = (src) => encode(src, true);
  // This trick is found broken https://github.com/dankogai/js-base64/issues/130
  // const btou = (src: string) => decodeURIComponent(escape(src));
  // reverting good old fationed regexp
  const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
  const cb_btou = (cccc) => {
      switch (cccc.length) {
          case 4:
              var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                  | ((0x3f & cccc.charCodeAt(1)) << 12)
                  | ((0x3f & cccc.charCodeAt(2)) << 6)
                  | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
              return (_fromCC((offset >>> 10) + 0xD800)
                  + _fromCC((offset & 0x3FF) + 0xDC00));
          case 3:
              return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
                  | ((0x3f & cccc.charCodeAt(1)) << 6)
                  | (0x3f & cccc.charCodeAt(2)));
          default:
              return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
                  | (0x3f & cccc.charCodeAt(1)));
      }
  };
  /**
   * @deprecated should have been internal use only.
   * @param {string} src UTF-16 string
   * @returns {string} UTF-8 string
   */
  const btou = (b) => b.replace(re_btou, cb_btou);
  /**
   * polyfill version of `atob`
   */
  const atobPolyfill = (asc) => {
      // console.log('polyfilled');
      asc = asc.replace(/\s+/g, '');
      if (!b64re.test(asc))
          throw new TypeError('malformed base64.');
      asc += '=='.slice(2 - (asc.length & 3));
      let u24, bin = '', r1, r2;
      for (let i = 0; i < asc.length;) {
          u24 = b64tab[asc.charAt(i++)] << 18
              | b64tab[asc.charAt(i++)] << 12
              | (r1 = b64tab[asc.charAt(i++)]) << 6
              | (r2 = b64tab[asc.charAt(i++)]);
          bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
              : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
                  : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
      }
      return bin;
  };
  /**
   * does what `window.atob` of web browsers do.
   * @param {String} asc Base64-encoded string
   * @returns {string} binary string
   */
  const _atob = typeof atob === 'function' ? (asc) => atob(_tidyB64(asc))
      : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
          : atobPolyfill;
  //
  const _toUint8Array = _hasBuffer
      ? (a) => _U8Afrom(Buffer.from(a, 'base64'))
      : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));
  /**
   * converts a Base64 string to a Uint8Array.
   */
  const toUint8Array = (a) => _toUint8Array(_unURI(a));
  //
  const _decode = _hasBuffer
      ? (a) => Buffer.from(a, 'base64').toString('utf8')
      : _TD
          ? (a) => _TD.decode(_toUint8Array(a))
          : (a) => btou(_atob(a));
  const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
  /**
   * converts a Base64 string to a UTF-8 string.
   * @param {String} src Base64 string.  Both normal and URL-safe are supported
   * @returns {string} UTF-8 string
   */
  const decode = (src) => _decode(_unURI(src));
  /**
   * check if a value is a valid Base64 string
   * @param {String} src a value to check
    */
  const isValid = (src) => {
      if (typeof src !== 'string')
          return false;
      const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
      return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
  };
  //
  const _noEnum = (v) => {
      return {
          value: v, enumerable: false, writable: true, configurable: true
      };
  };
  /**
   * extend String.prototype with relevant methods
   */
  const extendString = function () {
      const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
      _add('fromBase64', function () { return decode(this); });
      _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
      _add('toBase64URI', function () { return encode(this, true); });
      _add('toBase64URL', function () { return encode(this, true); });
      _add('toUint8Array', function () { return toUint8Array(this); });
  };
  /**
   * extend Uint8Array.prototype with relevant methods
   */
  const extendUint8Array = function () {
      const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
      _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
      _add('toBase64URI', function () { return fromUint8Array(this, true); });
      _add('toBase64URL', function () { return fromUint8Array(this, true); });
  };
  /**
   * extend Builtin prototypes with relevant methods
   */
  const extendBuiltins = () => {
      extendString();
      extendUint8Array();
  };
  const gBase64 = {
      version: version,
      VERSION: VERSION,
      atob: _atob,
      atobPolyfill: atobPolyfill,
      btoa: _btoa,
      btoaPolyfill: btoaPolyfill,
      fromBase64: decode,
      toBase64: encode,
      encode: encode,
      encodeURI: encodeURI,
      encodeURL: encodeURI,
      utob: utob,
      btou: btou,
      decode: decode,
      isValid: isValid,
      fromUint8Array: fromUint8Array,
      toUint8Array: toUint8Array,
      extendString: extendString,
      extendUint8Array: extendUint8Array,
      extendBuiltins: extendBuiltins
  };

  var requiresPort;
  var hasRequiredRequiresPort;

  function requireRequiresPort () {
  	if (hasRequiredRequiresPort) return requiresPort;
  	hasRequiredRequiresPort = 1;

  	/**
  	 * Check if we're required to add a port number.
  	 *
  	 * @see https://url.spec.whatwg.org/#default-port
  	 * @param {Number|String} port Port number we need to check
  	 * @param {String} protocol Protocol we need to check against.
  	 * @returns {Boolean} Is it a default port for the given protocol
  	 * @api private
  	 */
  	requiresPort = function required(port, protocol) {
  	  protocol = protocol.split(':')[0];
  	  port = +port;

  	  if (!port) return false;

  	  switch (protocol) {
  	    case 'http':
  	    case 'ws':
  	    return port !== 80;

  	    case 'https':
  	    case 'wss':
  	    return port !== 443;

  	    case 'ftp':
  	    return port !== 21;

  	    case 'gopher':
  	    return port !== 70;

  	    case 'file':
  	    return false;
  	  }

  	  return port !== 0;
  	};
  	return requiresPort;
  }

  var querystringify = {};

  var hasRequiredQuerystringify;

  function requireQuerystringify () {
  	if (hasRequiredQuerystringify) return querystringify;
  	hasRequiredQuerystringify = 1;

  	var has = Object.prototype.hasOwnProperty
  	  , undef;

  	/**
  	 * Decode a URI encoded string.
  	 *
  	 * @param {String} input The URI encoded string.
  	 * @returns {String|Null} The decoded string.
  	 * @api private
  	 */
  	function decode(input) {
  	  try {
  	    return decodeURIComponent(input.replace(/\+/g, ' '));
  	  } catch (e) {
  	    return null;
  	  }
  	}

  	/**
  	 * Attempts to encode a given input.
  	 *
  	 * @param {String} input The string that needs to be encoded.
  	 * @returns {String|Null} The encoded string.
  	 * @api private
  	 */
  	function encode(input) {
  	  try {
  	    return encodeURIComponent(input);
  	  } catch (e) {
  	    return null;
  	  }
  	}

  	/**
  	 * Simple query string parser.
  	 *
  	 * @param {String} query The query string that needs to be parsed.
  	 * @returns {Object}
  	 * @api public
  	 */
  	function querystring(query) {
  	  var parser = /([^=?#&]+)=?([^&]*)/g
  	    , result = {}
  	    , part;

  	  while (part = parser.exec(query)) {
  	    var key = decode(part[1])
  	      , value = decode(part[2]);

  	    //
  	    // Prevent overriding of existing properties. This ensures that build-in
  	    // methods like `toString` or __proto__ are not overriden by malicious
  	    // querystrings.
  	    //
  	    // In the case if failed decoding, we want to omit the key/value pairs
  	    // from the result.
  	    //
  	    if (key === null || value === null || key in result) continue;
  	    result[key] = value;
  	  }

  	  return result;
  	}

  	/**
  	 * Transform a query string to an object.
  	 *
  	 * @param {Object} obj Object that should be transformed.
  	 * @param {String} prefix Optional prefix.
  	 * @returns {String}
  	 * @api public
  	 */
  	function querystringify$1(obj, prefix) {
  	  prefix = prefix || '';

  	  var pairs = []
  	    , value
  	    , key;

  	  //
  	  // Optionally prefix with a '?' if needed
  	  //
  	  if ('string' !== typeof prefix) prefix = '?';

  	  for (key in obj) {
  	    if (has.call(obj, key)) {
  	      value = obj[key];

  	      //
  	      // Edge cases where we actually want to encode the value to an empty
  	      // string instead of the stringified value.
  	      //
  	      if (!value && (value === null || value === undef || isNaN(value))) {
  	        value = '';
  	      }

  	      key = encode(key);
  	      value = encode(value);

  	      //
  	      // If we failed to encode the strings, we should bail out as we don't
  	      // want to add invalid strings to the query.
  	      //
  	      if (key === null || value === null) continue;
  	      pairs.push(key +'='+ value);
  	    }
  	  }

  	  return pairs.length ? prefix + pairs.join('&') : '';
  	}

  	//
  	// Expose the module.
  	//
  	querystringify.stringify = querystringify$1;
  	querystringify.parse = querystring;
  	return querystringify;
  }

  var urlParse;
  var hasRequiredUrlParse;

  function requireUrlParse () {
  	if (hasRequiredUrlParse) return urlParse;
  	hasRequiredUrlParse = 1;

  	var required = requireRequiresPort()
  	  , qs = requireQuerystringify()
  	  , controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
  	  , CRHTLF = /[\n\r\t]/g
  	  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  	  , port = /:\d+$/
  	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
  	  , windowsDriveLetter = /^[a-zA-Z]:/;

  	/**
  	 * Remove control characters and whitespace from the beginning of a string.
  	 *
  	 * @param {Object|String} str String to trim.
  	 * @returns {String} A new string representing `str` stripped of control
  	 *     characters and whitespace from its beginning.
  	 * @public
  	 */
  	function trimLeft(str) {
  	  return (str ? str : '').toString().replace(controlOrWhitespace, '');
  	}

  	/**
  	 * These are the parse rules for the URL parser, it informs the parser
  	 * about:
  	 *
  	 * 0. The char it Needs to parse, if it's a string it should be done using
  	 *    indexOf, RegExp using exec and NaN means set as current value.
  	 * 1. The property we should set when parsing this value.
  	 * 2. Indication if it's backwards or forward parsing, when set as number it's
  	 *    the value of extra chars that should be split off.
  	 * 3. Inherit from location if non existing in the parser.
  	 * 4. `toLowerCase` the resulting value.
  	 */
  	var rules = [
  	  ['#', 'hash'],                        // Extract from the back.
  	  ['?', 'query'],                       // Extract from the back.
  	  function sanitize(address, url) {     // Sanitize what is left of the address
  	    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
  	  },
  	  ['/', 'pathname'],                    // Extract from the back.
  	  ['@', 'auth', 1],                     // Extract from the front.
  	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  	  [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
  	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
  	];

  	/**
  	 * These properties should not be copied or inherited from. This is only needed
  	 * for all non blob URL's as a blob URL does not include a hash, only the
  	 * origin.
  	 *
  	 * @type {Object}
  	 * @private
  	 */
  	var ignore = { hash: 1, query: 1 };

  	/**
  	 * The location object differs when your code is loaded through a normal page,
  	 * Worker or through a worker using a blob. And with the blobble begins the
  	 * trouble as the location object will contain the URL of the blob, not the
  	 * location of the page where our code is loaded in. The actual origin is
  	 * encoded in the `pathname` so we can thankfully generate a good "default"
  	 * location from it so we can generate proper relative URL's again.
  	 *
  	 * @param {Object|String} loc Optional default location object.
  	 * @returns {Object} lolcation object.
  	 * @public
  	 */
  	function lolcation(loc) {
  	  var globalVar;

  	  if (typeof window !== 'undefined') globalVar = window;
  	  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
  	  else if (typeof self !== 'undefined') globalVar = self;
  	  else globalVar = {};

  	  var location = globalVar.location || {};
  	  loc = loc || location;

  	  var finaldestination = {}
  	    , type = typeof loc
  	    , key;

  	  if ('blob:' === loc.protocol) {
  	    finaldestination = new Url(unescape(loc.pathname), {});
  	  } else if ('string' === type) {
  	    finaldestination = new Url(loc, {});
  	    for (key in ignore) delete finaldestination[key];
  	  } else if ('object' === type) {
  	    for (key in loc) {
  	      if (key in ignore) continue;
  	      finaldestination[key] = loc[key];
  	    }

  	    if (finaldestination.slashes === undefined) {
  	      finaldestination.slashes = slashes.test(loc.href);
  	    }
  	  }

  	  return finaldestination;
  	}

  	/**
  	 * Check whether a protocol scheme is special.
  	 *
  	 * @param {String} The protocol scheme of the URL
  	 * @return {Boolean} `true` if the protocol scheme is special, else `false`
  	 * @private
  	 */
  	function isSpecial(scheme) {
  	  return (
  	    scheme === 'file:' ||
  	    scheme === 'ftp:' ||
  	    scheme === 'http:' ||
  	    scheme === 'https:' ||
  	    scheme === 'ws:' ||
  	    scheme === 'wss:'
  	  );
  	}

  	/**
  	 * @typedef ProtocolExtract
  	 * @type Object
  	 * @property {String} protocol Protocol matched in the URL, in lowercase.
  	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
  	 * @property {String} rest Rest of the URL that is not part of the protocol.
  	 */

  	/**
  	 * Extract protocol information from a URL with/without double slash ("//").
  	 *
  	 * @param {String} address URL we want to extract from.
  	 * @param {Object} location
  	 * @return {ProtocolExtract} Extracted information.
  	 * @private
  	 */
  	function extractProtocol(address, location) {
  	  address = trimLeft(address);
  	  address = address.replace(CRHTLF, '');
  	  location = location || {};

  	  var match = protocolre.exec(address);
  	  var protocol = match[1] ? match[1].toLowerCase() : '';
  	  var forwardSlashes = !!match[2];
  	  var otherSlashes = !!match[3];
  	  var slashesCount = 0;
  	  var rest;

  	  if (forwardSlashes) {
  	    if (otherSlashes) {
  	      rest = match[2] + match[3] + match[4];
  	      slashesCount = match[2].length + match[3].length;
  	    } else {
  	      rest = match[2] + match[4];
  	      slashesCount = match[2].length;
  	    }
  	  } else {
  	    if (otherSlashes) {
  	      rest = match[3] + match[4];
  	      slashesCount = match[3].length;
  	    } else {
  	      rest = match[4];
  	    }
  	  }

  	  if (protocol === 'file:') {
  	    if (slashesCount >= 2) {
  	      rest = rest.slice(2);
  	    }
  	  } else if (isSpecial(protocol)) {
  	    rest = match[4];
  	  } else if (protocol) {
  	    if (forwardSlashes) {
  	      rest = rest.slice(2);
  	    }
  	  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
  	    rest = match[4];
  	  }

  	  return {
  	    protocol: protocol,
  	    slashes: forwardSlashes || isSpecial(protocol),
  	    slashesCount: slashesCount,
  	    rest: rest
  	  };
  	}

  	/**
  	 * Resolve a relative URL pathname against a base URL pathname.
  	 *
  	 * @param {String} relative Pathname of the relative URL.
  	 * @param {String} base Pathname of the base URL.
  	 * @return {String} Resolved pathname.
  	 * @private
  	 */
  	function resolve(relative, base) {
  	  if (relative === '') return base;

  	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
  	    , i = path.length
  	    , last = path[i - 1]
  	    , unshift = false
  	    , up = 0;

  	  while (i--) {
  	    if (path[i] === '.') {
  	      path.splice(i, 1);
  	    } else if (path[i] === '..') {
  	      path.splice(i, 1);
  	      up++;
  	    } else if (up) {
  	      if (i === 0) unshift = true;
  	      path.splice(i, 1);
  	      up--;
  	    }
  	  }

  	  if (unshift) path.unshift('');
  	  if (last === '.' || last === '..') path.push('');

  	  return path.join('/');
  	}

  	/**
  	 * The actual URL instance. Instead of returning an object we've opted-in to
  	 * create an actual constructor as it's much more memory efficient and
  	 * faster and it pleases my OCD.
  	 *
  	 * It is worth noting that we should not use `URL` as class name to prevent
  	 * clashes with the global URL instance that got introduced in browsers.
  	 *
  	 * @constructor
  	 * @param {String} address URL we want to parse.
  	 * @param {Object|String} [location] Location defaults for relative paths.
  	 * @param {Boolean|Function} [parser] Parser for the query string.
  	 * @private
  	 */
  	function Url(address, location, parser) {
  	  address = trimLeft(address);
  	  address = address.replace(CRHTLF, '');

  	  if (!(this instanceof Url)) {
  	    return new Url(address, location, parser);
  	  }

  	  var relative, extracted, parse, instruction, index, key
  	    , instructions = rules.slice()
  	    , type = typeof location
  	    , url = this
  	    , i = 0;

  	  //
  	  // The following if statements allows this module two have compatibility with
  	  // 2 different API:
  	  //
  	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  	  //    where the boolean indicates that the query string should also be parsed.
  	  //
  	  // 2. The `URL` interface of the browser which accepts a URL, object as
  	  //    arguments. The supplied object will be used as default values / fall-back
  	  //    for relative paths.
  	  //
  	  if ('object' !== type && 'string' !== type) {
  	    parser = location;
  	    location = null;
  	  }

  	  if (parser && 'function' !== typeof parser) parser = qs.parse;

  	  location = lolcation(location);

  	  //
  	  // Extract protocol information before running the instructions.
  	  //
  	  extracted = extractProtocol(address || '', location);
  	  relative = !extracted.protocol && !extracted.slashes;
  	  url.slashes = extracted.slashes || relative && location.slashes;
  	  url.protocol = extracted.protocol || location.protocol || '';
  	  address = extracted.rest;

  	  //
  	  // When the authority component is absent the URL starts with a path
  	  // component.
  	  //
  	  if (
  	    extracted.protocol === 'file:' && (
  	      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
  	    (!extracted.slashes &&
  	      (extracted.protocol ||
  	        extracted.slashesCount < 2 ||
  	        !isSpecial(url.protocol)))
  	  ) {
  	    instructions[3] = [/(.*)/, 'pathname'];
  	  }

  	  for (; i < instructions.length; i++) {
  	    instruction = instructions[i];

  	    if (typeof instruction === 'function') {
  	      address = instruction(address, url);
  	      continue;
  	    }

  	    parse = instruction[0];
  	    key = instruction[1];

  	    if (parse !== parse) {
  	      url[key] = address;
  	    } else if ('string' === typeof parse) {
  	      index = parse === '@'
  	        ? address.lastIndexOf(parse)
  	        : address.indexOf(parse);

  	      if (~index) {
  	        if ('number' === typeof instruction[2]) {
  	          url[key] = address.slice(0, index);
  	          address = address.slice(index + instruction[2]);
  	        } else {
  	          url[key] = address.slice(index);
  	          address = address.slice(0, index);
  	        }
  	      }
  	    } else if ((index = parse.exec(address))) {
  	      url[key] = index[1];
  	      address = address.slice(0, index.index);
  	    }

  	    url[key] = url[key] || (
  	      relative && instruction[3] ? location[key] || '' : ''
  	    );

  	    //
  	    // Hostname, host and protocol should be lowercased so they can be used to
  	    // create a proper `origin`.
  	    //
  	    if (instruction[4]) url[key] = url[key].toLowerCase();
  	  }

  	  //
  	  // Also parse the supplied query string in to an object. If we're supplied
  	  // with a custom parser as function use that instead of the default build-in
  	  // parser.
  	  //
  	  if (parser) url.query = parser(url.query);

  	  //
  	  // If the URL is relative, resolve the pathname against the base URL.
  	  //
  	  if (
  	      relative
  	    && location.slashes
  	    && url.pathname.charAt(0) !== '/'
  	    && (url.pathname !== '' || location.pathname !== '')
  	  ) {
  	    url.pathname = resolve(url.pathname, location.pathname);
  	  }

  	  //
  	  // Default to a / for pathname if none exists. This normalizes the URL
  	  // to always have a /
  	  //
  	  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
  	    url.pathname = '/' + url.pathname;
  	  }

  	  //
  	  // We should not add port numbers if they are already the default port number
  	  // for a given protocol. As the host also contains the port number we're going
  	  // override it with the hostname which contains no port number.
  	  //
  	  if (!required(url.port, url.protocol)) {
  	    url.host = url.hostname;
  	    url.port = '';
  	  }

  	  //
  	  // Parse down the `auth` for the username and password.
  	  //
  	  url.username = url.password = '';

  	  if (url.auth) {
  	    index = url.auth.indexOf(':');

  	    if (~index) {
  	      url.username = url.auth.slice(0, index);
  	      url.username = encodeURIComponent(decodeURIComponent(url.username));

  	      url.password = url.auth.slice(index + 1);
  	      url.password = encodeURIComponent(decodeURIComponent(url.password));
  	    } else {
  	      url.username = encodeURIComponent(decodeURIComponent(url.auth));
  	    }

  	    url.auth = url.password ? url.username +':'+ url.password : url.username;
  	  }

  	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
  	    ? url.protocol +'//'+ url.host
  	    : 'null';

  	  //
  	  // The href is just the compiled result.
  	  //
  	  url.href = url.toString();
  	}

  	/**
  	 * This is convenience method for changing properties in the URL instance to
  	 * insure that they all propagate correctly.
  	 *
  	 * @param {String} part          Property we need to adjust.
  	 * @param {Mixed} value          The newly assigned value.
  	 * @param {Boolean|Function} fn  When setting the query, it will be the function
  	 *                               used to parse the query.
  	 *                               When setting the protocol, double slash will be
  	 *                               removed from the final url if it is true.
  	 * @returns {URL} URL instance for chaining.
  	 * @public
  	 */
  	function set(part, value, fn) {
  	  var url = this;

  	  switch (part) {
  	    case 'query':
  	      if ('string' === typeof value && value.length) {
  	        value = (fn || qs.parse)(value);
  	      }

  	      url[part] = value;
  	      break;

  	    case 'port':
  	      url[part] = value;

  	      if (!required(value, url.protocol)) {
  	        url.host = url.hostname;
  	        url[part] = '';
  	      } else if (value) {
  	        url.host = url.hostname +':'+ value;
  	      }

  	      break;

  	    case 'hostname':
  	      url[part] = value;

  	      if (url.port) value += ':'+ url.port;
  	      url.host = value;
  	      break;

  	    case 'host':
  	      url[part] = value;

  	      if (port.test(value)) {
  	        value = value.split(':');
  	        url.port = value.pop();
  	        url.hostname = value.join(':');
  	      } else {
  	        url.hostname = value;
  	        url.port = '';
  	      }

  	      break;

  	    case 'protocol':
  	      url.protocol = value.toLowerCase();
  	      url.slashes = !fn;
  	      break;

  	    case 'pathname':
  	    case 'hash':
  	      if (value) {
  	        var char = part === 'pathname' ? '/' : '#';
  	        url[part] = value.charAt(0) !== char ? char + value : value;
  	      } else {
  	        url[part] = value;
  	      }
  	      break;

  	    case 'username':
  	    case 'password':
  	      url[part] = encodeURIComponent(value);
  	      break;

  	    case 'auth':
  	      var index = value.indexOf(':');

  	      if (~index) {
  	        url.username = value.slice(0, index);
  	        url.username = encodeURIComponent(decodeURIComponent(url.username));

  	        url.password = value.slice(index + 1);
  	        url.password = encodeURIComponent(decodeURIComponent(url.password));
  	      } else {
  	        url.username = encodeURIComponent(decodeURIComponent(value));
  	      }
  	  }

  	  for (var i = 0; i < rules.length; i++) {
  	    var ins = rules[i];

  	    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  	  }

  	  url.auth = url.password ? url.username +':'+ url.password : url.username;

  	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
  	    ? url.protocol +'//'+ url.host
  	    : 'null';

  	  url.href = url.toString();

  	  return url;
  	}

  	/**
  	 * Transform the properties back in to a valid and full URL string.
  	 *
  	 * @param {Function} stringify Optional query stringify function.
  	 * @returns {String} Compiled version of the URL.
  	 * @public
  	 */
  	function toString(stringify) {
  	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  	  var query
  	    , url = this
  	    , host = url.host
  	    , protocol = url.protocol;

  	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  	  var result =
  	    protocol +
  	    ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

  	  if (url.username) {
  	    result += url.username;
  	    if (url.password) result += ':'+ url.password;
  	    result += '@';
  	  } else if (url.password) {
  	    result += ':'+ url.password;
  	    result += '@';
  	  } else if (
  	    url.protocol !== 'file:' &&
  	    isSpecial(url.protocol) &&
  	    !host &&
  	    url.pathname !== '/'
  	  ) {
  	    //
  	    // Add back the empty userinfo, otherwise the original invalid URL
  	    // might be transformed into a valid one with `url.pathname` as host.
  	    //
  	    result += '@';
  	  }

  	  //
  	  // Trailing colon is removed from `url.host` when it is parsed. If it still
  	  // ends with a colon, then add back the trailing colon that was removed. This
  	  // prevents an invalid URL from being transformed into a valid one.
  	  //
  	  if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
  	    host += ':';
  	  }

  	  result += host + url.pathname;

  	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  	  if (url.hash) result += url.hash;

  	  return result;
  	}

  	Url.prototype = { set: set, toString: toString };

  	//
  	// Expose the URL parser and some additional properties that might be useful for
  	// others or testing.
  	//
  	Url.extractProtocol = extractProtocol;
  	Url.location = lolcation;
  	Url.trimLeft = trimLeft;
  	Url.qs = qs;

  	urlParse = Url;
  	return urlParse;
  }

  var urlParseExports = requireUrlParse();
  var URL = /*@__PURE__*/getDefaultExportFromCjs(urlParseExports);

  /**
   * Generate a UUID v4 based on random numbers. We intentioanlly use the less
   * secure Math.random function here since the more secure crypto.getRandomNumbers
   * is not available on all platforms.
   * This is not a problem for us since we use the UUID only for generating a
   * request ID, so we can correlate server logs to client errors.
   *
   * This function is taken from following site:
   * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
   *
   * @return {string} The generate UUID
   */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  const PROTOCOL_TUS_V1 = 'tus-v1';
  const PROTOCOL_IETF_DRAFT_03 = 'ietf-draft-03';
  const PROTOCOL_IETF_DRAFT_05 = 'ietf-draft-05';
  const defaultOptions$1 = {
    endpoint: null,
    uploadUrl: null,
    metadata: {},
    metadataForPartialUploads: {},
    fingerprint: null,
    uploadSize: null,
    onProgress: null,
    onChunkComplete: null,
    onSuccess: null,
    onError: null,
    onUploadUrlAvailable: null,
    overridePatchMethod: false,
    headers: {},
    addRequestId: false,
    onBeforeRequest: null,
    onAfterResponse: null,
    onShouldRetry: defaultOnShouldRetry,
    chunkSize: Number.POSITIVE_INFINITY,
    retryDelays: [0, 1000, 3000, 5000],
    parallelUploads: 1,
    parallelUploadBoundaries: null,
    storeFingerprintForResuming: true,
    removeFingerprintOnSuccess: false,
    uploadLengthDeferred: false,
    uploadDataDuringCreation: false,
    urlStorage: null,
    fileReader: null,
    httpStack: null,
    protocol: PROTOCOL_TUS_V1
  };
  class BaseUpload {
    constructor(file, options) {
      // Warn about removed options from previous versions
      if ('resume' in options) {
        console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.');
      }

      // The default options will already be added from the wrapper classes.
      this.options = options;

      // Cast chunkSize to integer
      this.options.chunkSize = Number(this.options.chunkSize);

      // The storage module used to store URLs
      this._urlStorage = this.options.urlStorage;

      // The underlying File/Blob object
      this.file = file;

      // The URL against which the file will be uploaded
      this.url = null;

      // The underlying request object for the current PATCH request
      this._req = null;

      // The fingerpinrt for the current file (set after start())
      this._fingerprint = null;

      // The key that the URL storage returned when saving an URL with a fingerprint,
      this._urlStorageKey = null;

      // The offset used in the current PATCH request
      this._offset = null;

      // True if the current PATCH request has been aborted
      this._aborted = false;

      // The file's size in bytes
      this._size = null;

      // The Source object which will wrap around the given file and provides us
      // with a unified interface for getting its size and slice chunks from its
      // content allowing us to easily handle Files, Blobs, Buffers and Streams.
      this._source = null;

      // The current count of attempts which have been made. Zero indicates none.
      this._retryAttempt = 0;

      // The timeout's ID which is used to delay the next retry
      this._retryTimeout = null;

      // The offset of the remote upload before the latest attempt was started.
      this._offsetBeforeRetry = 0;

      // An array of BaseUpload instances which are used for uploading the different
      // parts, if the parallelUploads option is used.
      this._parallelUploads = null;

      // An array of upload URLs which are used for uploading the different
      // parts, if the parallelUploads option is used.
      this._parallelUploadUrls = null;
    }

    /**
     * Use the Termination extension to delete an upload from the server by sending a DELETE
     * request to the specified upload URL. This is only possible if the server supports the
     * Termination extension. If the `options.retryDelays` property is set, the method will
     * also retry if an error ocurrs.
     *
     * @param {String} url The upload's URL which will be terminated.
     * @param {object} options Optional options for influencing HTTP requests.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */
    static terminate(url, options = {}) {
      const req = openRequest('DELETE', url, options);
      return sendRequest(req, null, options).then(res => {
        // A 204 response indicates a successfull request
        if (res.getStatus() === 204) {
          return;
        }
        throw new DetailedError('tus: unexpected response while terminating upload', null, req, res);
      }).catch(err => {
        if (!(err instanceof DetailedError)) {
          err = new DetailedError('tus: failed to terminate upload', err, req, null);
        }
        if (!shouldRetry(err, 0, options)) {
          throw err;
        }

        // Instead of keeping track of the retry attempts, we remove the first element from the delays
        // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
        // We recursively call the terminate function will removing elements from the retryDelays array.
        const delay = options.retryDelays[0];
        const remainingDelays = options.retryDelays.slice(1);
        const newOptions = {
          ...options,
          retryDelays: remainingDelays
        };
        return new Promise(resolve => setTimeout(resolve, delay)).then(() => BaseUpload.terminate(url, newOptions));
      });
    }
    findPreviousUploads() {
      return this.options.fingerprint(this.file, this.options).then(fingerprint => this._urlStorage.findUploadsByFingerprint(fingerprint));
    }
    resumeFromPreviousUpload(previousUpload) {
      this.url = previousUpload.uploadUrl || null;
      this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
      this._urlStorageKey = previousUpload.urlStorageKey;
    }
    start() {
      const {
        file
      } = this;
      if (!file) {
        this._emitError(new Error('tus: no file or stream to upload provided'));
        return;
      }
      if (![PROTOCOL_TUS_V1, PROTOCOL_IETF_DRAFT_03, PROTOCOL_IETF_DRAFT_05].includes(this.options.protocol)) {
        this._emitError(new Error(`tus: unsupported protocol ${this.options.protocol}`));
        return;
      }
      if (!this.options.endpoint && !this.options.uploadUrl && !this.url) {
        this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));
        return;
      }
      const {
        retryDelays
      } = this.options;
      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
        this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));
        return;
      }
      if (this.options.parallelUploads > 1) {
        // Test which options are incompatible with parallel uploads.
        for (const optionName of ['uploadUrl', 'uploadSize', 'uploadLengthDeferred']) {
          if (this.options[optionName]) {
            this._emitError(new Error(`tus: cannot use the ${optionName} option when parallelUploads is enabled`));
            return;
          }
        }
      }
      if (this.options.parallelUploadBoundaries) {
        if (this.options.parallelUploads <= 1) {
          this._emitError(new Error('tus: cannot use the `parallelUploadBoundaries` option when `parallelUploads` is disabled'));
          return;
        }
        if (this.options.parallelUploads !== this.options.parallelUploadBoundaries.length) {
          this._emitError(new Error('tus: the `parallelUploadBoundaries` must have the same length as the value of `parallelUploads`'));
          return;
        }
      }
      this.options.fingerprint(file, this.options).then(fingerprint => {
        this._fingerprint = fingerprint;
        if (this._source) {
          return this._source;
        }
        return this.options.fileReader.openFile(file, this.options.chunkSize);
      }).then(source => {
        this._source = source;

        // First, we look at the uploadLengthDeferred option.
        // Next, we check if the caller has supplied a manual upload size.
        // Finally, we try to use the calculated size from the source object.
        if (this.options.uploadLengthDeferred) {
          this._size = null;
        } else if (this.options.uploadSize != null) {
          this._size = Number(this.options.uploadSize);
          if (Number.isNaN(this._size)) {
            this._emitError(new Error('tus: cannot convert `uploadSize` option into a number'));
            return;
          }
        } else {
          this._size = this._source.size;
          if (this._size == null) {
            this._emitError(new Error("tus: cannot automatically derive upload's size from input. Specify it manually using the `uploadSize` option or use the `uploadLengthDeferred` option"));
            return;
          }
        }

        // If the upload was configured to use multiple requests or if we resume from
        // an upload which used multiple requests, we start a parallel upload.
        if (this.options.parallelUploads > 1 || this._parallelUploadUrls != null) {
          this._startParallelUpload();
        } else {
          this._startSingleUpload();
        }
      }).catch(err => {
        this._emitError(err);
      });
    }

    /**
     * Initiate the uploading procedure for a parallelized upload, where one file is split into
     * multiple request which are run in parallel.
     *
     * @api private
     */
    _startParallelUpload() {
      const totalSize = this._size;
      let totalProgress = 0;
      this._parallelUploads = [];
      const partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads;

      // The input file will be split into multiple slices which are uploaded in separate
      // requests. Here we get the start and end position for the slices.
      const parts = this.options.parallelUploadBoundaries ?? splitSizeIntoParts(this._source.size, partCount);

      // Attach URLs from previous uploads, if available.
      if (this._parallelUploadUrls) {
        parts.forEach((part, index) => {
          part.uploadUrl = this._parallelUploadUrls[index] || null;
        });
      }

      // Create an empty list for storing the upload URLs
      this._parallelUploadUrls = new Array(parts.length);

      // Generate a promise for each slice that will be resolve if the respective
      // upload is completed.
      const uploads = parts.map((part, index) => {
        let lastPartProgress = 0;
        return this._source.slice(part.start, part.end).then(({
          value
        }) => new Promise((resolve, reject) => {
          // Merge with the user supplied options but overwrite some values.
          const options = {
            ...this.options,
            // If available, the partial upload should be resumed from a previous URL.
            uploadUrl: part.uploadUrl || null,
            // We take manually care of resuming for partial uploads, so they should
            // not be stored in the URL storage.
            storeFingerprintForResuming: false,
            removeFingerprintOnSuccess: false,
            // Reset the parallelUploads option to not cause recursion.
            parallelUploads: 1,
            // Reset this option as we are not doing a parallel upload.
            parallelUploadBoundaries: null,
            metadata: this.options.metadataForPartialUploads,
            // Add the header to indicate the this is a partial upload.
            headers: {
              ...this.options.headers,
              'Upload-Concat': 'partial'
            },
            // Reject or resolve the promise if the upload errors or completes.
            onSuccess: resolve,
            onError: reject,
            // Based in the progress for this partial upload, calculate the progress
            // for the entire final upload.
            onProgress: newPartProgress => {
              totalProgress = totalProgress - lastPartProgress + newPartProgress;
              lastPartProgress = newPartProgress;
              this._emitProgress(totalProgress, totalSize);
            },
            // Wait until every partial upload has an upload URL, so we can add
            // them to the URL storage.
            onUploadUrlAvailable: () => {
              this._parallelUploadUrls[index] = upload.url;
              // Test if all uploads have received an URL
              if (this._parallelUploadUrls.filter(u => Boolean(u)).length === parts.length) {
                this._saveUploadInUrlStorage();
              }
            }
          };
          const upload = new BaseUpload(value, options);
          upload.start();

          // Store the upload in an array, so we can later abort them if necessary.
          this._parallelUploads.push(upload);
        }));
      });
      let req;
      // Wait until all partial uploads are finished and we can send the POST request for
      // creating the final upload.
      Promise.all(uploads).then(() => {
        req = this._openRequest('POST', this.options.endpoint);
        req.setHeader('Upload-Concat', `final;${this._parallelUploadUrls.join(' ')}`);

        // Add metadata if values have been added
        const metadata = encodeMetadata(this.options.metadata);
        if (metadata !== '') {
          req.setHeader('Upload-Metadata', metadata);
        }
        return this._sendRequest(req, null);
      }).then(res => {
        if (!inStatusCategory(res.getStatus(), 200)) {
          this._emitHttpError(req, res, 'tus: unexpected response while creating upload');
          return;
        }
        const location = res.getHeader('Location');
        if (location == null) {
          this._emitHttpError(req, res, 'tus: invalid or missing Location header');
          return;
        }
        this.url = resolveUrl(this.options.endpoint, location);
        log(`Created upload at ${this.url}`);
        this._emitSuccess(res);
      }).catch(err => {
        this._emitError(err);
      });
    }

    /**
     * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
     * uploaded in a sequential matter.
     *
     * @api private
     */
    _startSingleUpload() {
      // Reset the aborted flag when the upload is started or else the
      // _performUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;

      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        log(`Resuming upload from previous URL: ${this.url}`);
        this._resumeUpload();
        return;
      }

      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        log(`Resuming upload from provided URL: ${this.options.uploadUrl}`);
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }
      this._createUpload();
    }

    /**
     * Abort any running request and stop the current upload. After abort is called, no event
     * handler will be invoked anymore. You can use the `start` method to resume the upload
     * again.
     * If `shouldTerminate` is true, the `terminate` function will be called to remove the
     * current upload from the server.
     *
     * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */
    abort(shouldTerminate) {
      // Stop any parallel partial uploads, that have been started in _startParallelUploads.
      if (this._parallelUploads != null) {
        for (const upload of this._parallelUploads) {
          upload.abort(shouldTerminate);
        }
      }

      // Stop any current running request.
      if (this._req !== null) {
        this._req.abort();
        // Note: We do not close the file source here, so the user can resume in the future.
      }
      this._aborted = true;

      // Stop any timeout used for initiating a retry.
      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }
      if (!shouldTerminate || this.url == null) {
        return Promise.resolve();
      }
      return BaseUpload.terminate(this.url, this.options)
      // Remove entry from the URL storage since the upload URL is no longer valid.
      .then(() => this._removeFromUrlStorage());
    }
    _emitHttpError(req, res, message, causingErr) {
      this._emitError(new DetailedError(message, causingErr, req, res));
    }
    _emitError(err) {
      // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.
      if (this._aborted) return;

      // Check if we should retry, when enabled, before sending the error to the user.
      if (this.options.retryDelays != null) {
        // We will reset the attempt counter if
        // - we were already able to connect to the server (offset != null) and
        // - we were able to upload a small chunk of data to the server
        const shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;
        if (shouldResetDelays) {
          this._retryAttempt = 0;
        }
        if (shouldRetry(err, this._retryAttempt, this.options)) {
          const delay = this.options.retryDelays[this._retryAttempt++];
          this._offsetBeforeRetry = this._offset;
          this._retryTimeout = setTimeout(() => {
            this.start();
          }, delay);
          return;
        }
      }
      if (typeof this.options.onError === 'function') {
        this.options.onError(err);
      } else {
        throw err;
      }
    }

    /**
     * Publishes notification if the upload has been successfully completed.
     *
     * @param {object} lastResponse Last HTTP response.
     * @api private
     */
    _emitSuccess(lastResponse) {
      if (this.options.removeFingerprintOnSuccess) {
        // Remove stored fingerprint and corresponding endpoint. This causes
        // new uploads of the same file to be treated as a different file.
        this._removeFromUrlStorage();
      }
      if (typeof this.options.onSuccess === 'function') {
        this.options.onSuccess({
          lastResponse
        });
      }
    }

    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     *
     * @param {number} bytesSent  Number of bytes sent to the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
    _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === 'function') {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }

    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param {number} chunkSize  Size of the chunk that was accepted by the server.
     * @param {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
    _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === 'function') {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }

    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */
    _createUpload() {
      if (!this.options.endpoint) {
        this._emitError(new Error('tus: unable to create upload because no endpoint is provided'));
        return;
      }
      const req = this._openRequest('POST', this.options.endpoint);
      if (this.options.uploadLengthDeferred) {
        req.setHeader('Upload-Defer-Length', '1');
      } else {
        req.setHeader('Upload-Length', `${this._size}`);
      }

      // Add metadata if values have been added
      const metadata = encodeMetadata(this.options.metadata);
      if (metadata !== '') {
        req.setHeader('Upload-Metadata', metadata);
      }
      let promise;
      if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
        this._offset = 0;
        promise = this._addChunkToRequest(req);
      } else {
        if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader('Upload-Complete', '?0');
        }
        promise = this._sendRequest(req, null);
      }
      promise.then(res => {
        if (!inStatusCategory(res.getStatus(), 200)) {
          this._emitHttpError(req, res, 'tus: unexpected response while creating upload');
          return;
        }
        const location = res.getHeader('Location');
        if (location == null) {
          this._emitHttpError(req, res, 'tus: invalid or missing Location header');
          return;
        }
        this.url = resolveUrl(this.options.endpoint, location);
        log(`Created upload at ${this.url}`);
        if (typeof this.options.onUploadUrlAvailable === 'function') {
          this.options.onUploadUrlAvailable();
        }
        if (this._size === 0) {
          // Nothing to upload and file was successfully created
          this._emitSuccess(res);
          this._source.close();
          return;
        }
        this._saveUploadInUrlStorage().then(() => {
          if (this.options.uploadDataDuringCreation) {
            this._handleUploadResponse(req, res);
          } else {
            this._offset = 0;
            this._performUpload();
          }
        });
      }).catch(err => {
        this._emitHttpError(req, null, 'tus: failed to create upload', err);
      });
    }

    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */
    _resumeUpload() {
      const req = this._openRequest('HEAD', this.url);
      const promise = this._sendRequest(req, null);
      promise.then(res => {
        const status = res.getStatus();
        if (!inStatusCategory(status, 200)) {
          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (status === 423) {
            this._emitHttpError(req, res, 'tus: upload is currently locked; retry later');
            return;
          }
          if (inStatusCategory(status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            this._removeFromUrlStorage();
          }
          if (!this.options.endpoint) {
            // Don't attempt to create a new upload if no endpoint is provided.
            this._emitHttpError(req, res, 'tus: unable to resume upload (new upload cannot be created without an endpoint)');
            return;
          }

          // Try to create a new upload
          this.url = null;
          this._createUpload();
          return;
        }
        const offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
        if (Number.isNaN(offset)) {
          this._emitHttpError(req, res, 'tus: invalid or missing offset value');
          return;
        }
        const length = Number.parseInt(res.getHeader('Upload-Length'), 10);
        if (Number.isNaN(length) && !this.options.uploadLengthDeferred && this.options.protocol === PROTOCOL_TUS_V1) {
          this._emitHttpError(req, res, 'tus: invalid or missing length value');
          return;
        }
        if (typeof this.options.onUploadUrlAvailable === 'function') {
          this.options.onUploadUrlAvailable();
        }
        this._saveUploadInUrlStorage().then(() => {
          // Upload has already been completed and we do not need to send additional
          // data to the server
          if (offset === length) {
            this._emitProgress(length, length);
            this._emitSuccess(res);
            return;
          }
          this._offset = offset;
          this._performUpload();
        });
      }).catch(err => {
        this._emitHttpError(req, null, 'tus: failed to resume upload', err);
      });
    }

    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */
    _performUpload() {
      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }
      let req;

      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        req = this._openRequest('POST', this.url);
        req.setHeader('X-HTTP-Method-Override', 'PATCH');
      } else {
        req = this._openRequest('PATCH', this.url);
      }
      req.setHeader('Upload-Offset', `${this._offset}`);
      const promise = this._addChunkToRequest(req);
      promise.then(res => {
        if (!inStatusCategory(res.getStatus(), 200)) {
          this._emitHttpError(req, res, 'tus: unexpected response while uploading chunk');
          return;
        }
        this._handleUploadResponse(req, res);
      }).catch(err => {
        // Don't emit an error if the upload was aborted manually
        if (this._aborted) {
          return;
        }
        this._emitHttpError(req, null, `tus: failed to upload chunk at offset ${this._offset}`, err);
      });
    }

    /**
     * _addChunktoRequest reads a chunk from the source and sends it using the
     * supplied request object. It will not handle the response.
     *
     * @api private
     */
    _addChunkToRequest(req) {
      const start = this._offset;
      let end = this._offset + this.options.chunkSize;
      req.setProgressHandler(bytesSent => {
        this._emitProgress(start + bytesSent, this._size);
      });
      if (this.options.protocol === PROTOCOL_TUS_V1) {
        req.setHeader('Content-Type', 'application/offset+octet-stream');
      } else if (this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
        req.setHeader('Content-Type', 'application/partial-upload');
      }

      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if ((end === Number.POSITIVE_INFINITY || end > this._size) && !this.options.uploadLengthDeferred) {
        end = this._size;
      }
      return this._source.slice(start, end).then(({
        value,
        done
      }) => {
        const valueSize = value?.size ? value.size : 0;

        // If the upload length is deferred, the upload size was not specified during
        // upload creation. So, if the file reader is done reading, we know the total
        // upload size and can tell the tus server.
        if (this.options.uploadLengthDeferred && done) {
          this._size = this._offset + valueSize;
          req.setHeader('Upload-Length', `${this._size}`);
        }

        // The specified uploadSize might not match the actual amount of data that a source
        // provides. In these cases, we cannot successfully complete the upload, so we
        // rather error out and let the user know. If not, tus-js-client will be stuck
        // in a loop of repeating empty PATCH requests.
        // See https://community.transloadit.com/t/how-to-abort-hanging-companion-uploads/16488/13
        const newSize = this._offset + valueSize;
        if (!this.options.uploadLengthDeferred && done && newSize !== this._size) {
          return Promise.reject(new Error(`upload was configured with a size of ${this._size} bytes, but the source is done after ${newSize} bytes`));
        }
        if (value === null) {
          return this._sendRequest(req);
        }
        if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader('Upload-Complete', done ? '?1' : '?0');
        }
        this._emitProgress(this._offset, this._size);
        return this._sendRequest(req, value);
      });
    }

    /**
     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
     * and already have received a response.
     *
     * @api private
     */
    _handleUploadResponse(req, res) {
      const offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
      if (Number.isNaN(offset)) {
        this._emitHttpError(req, res, 'tus: invalid or missing offset value');
        return;
      }
      this._emitProgress(offset, this._size);
      this._emitChunkComplete(offset - this._offset, offset, this._size);
      this._offset = offset;
      if (offset === this._size) {
        // Yay, finally done :)
        this._emitSuccess(res);
        this._source.close();
        return;
      }
      this._performUpload();
    }

    /**
     * Create a new HTTP request object with the given method and URL.
     *
     * @api private
     */
    _openRequest(method, url) {
      const req = openRequest(method, url, this.options);
      this._req = req;
      return req;
    }

    /**
     * Remove the entry in the URL storage, if it has been saved before.
     *
     * @api private
     */
    _removeFromUrlStorage() {
      if (!this._urlStorageKey) return;
      this._urlStorage.removeUpload(this._urlStorageKey).catch(err => {
        this._emitError(err);
      });
      this._urlStorageKey = null;
    }

    /**
     * Add the upload URL to the URL storage, if possible.
     *
     * @api private
     */
    _saveUploadInUrlStorage() {
      // We do not store the upload URL
      // - if it was disabled in the option, or
      // - if no fingerprint was calculated for the input (i.e. a stream), or
      // - if the URL is already stored (i.e. key is set alread).
      if (!this.options.storeFingerprintForResuming || !this._fingerprint || this._urlStorageKey !== null) {
        return Promise.resolve();
      }
      const storedUpload = {
        size: this._size,
        metadata: this.options.metadata,
        creationTime: new Date().toString()
      };
      if (this._parallelUploads) {
        // Save multiple URLs if the parallelUploads option is used ...
        storedUpload.parallelUploadUrls = this._parallelUploadUrls;
      } else {
        // ... otherwise we just save the one available URL.
        storedUpload.uploadUrl = this.url;
      }
      return this._urlStorage.addUpload(this._fingerprint, storedUpload).then(urlStorageKey => {
        this._urlStorageKey = urlStorageKey;
      });
    }

    /**
     * Send a request with the provided body.
     *
     * @api private
     */
    _sendRequest(req, body = null) {
      return sendRequest(req, body, this.options);
    }
  }
  function encodeMetadata(metadata) {
    return Object.entries(metadata).map(([key, value]) => `${key} ${gBase64.encode(String(value))}`).join(',');
  }

  /**
   * Checks whether a given status is in the range of the expected category.
   * For example, only a status between 200 and 299 will satisfy the category 200.
   *
   * @api private
   */
  function inStatusCategory(status, category) {
    return status >= category && status < category + 100;
  }

  /**
   * Create a new HTTP request with the specified method and URL.
   * The necessary headers that are included in every request
   * will be added, including the request ID.
   *
   * @api private
   */
  function openRequest(method, url, options) {
    const req = options.httpStack.createRequest(method, url);
    if (options.protocol === PROTOCOL_IETF_DRAFT_03) {
      req.setHeader('Upload-Draft-Interop-Version', '5');
    } else if (options.protocol === PROTOCOL_IETF_DRAFT_05) {
      req.setHeader('Upload-Draft-Interop-Version', '6');
    } else {
      req.setHeader('Tus-Resumable', '1.0.0');
    }
    const headers = options.headers || {};
    for (const [name, value] of Object.entries(headers)) {
      req.setHeader(name, value);
    }
    if (options.addRequestId) {
      const requestId = uuid();
      req.setHeader('X-Request-ID', requestId);
    }
    return req;
  }

  /**
   * Send a request with the provided body while invoking the onBeforeRequest
   * and onAfterResponse callbacks.
   *
   * @api private
   */
  async function sendRequest(req, body, options) {
    if (typeof options.onBeforeRequest === 'function') {
      await options.onBeforeRequest(req);
    }
    const res = await req.send(body);
    if (typeof options.onAfterResponse === 'function') {
      await options.onAfterResponse(req, res);
    }
    return res;
  }

  /**
   * Checks whether the browser running this code has internet access.
   * This function will always return true in the node.js environment
   *
   * @api private
   */
  function isOnline() {
    let online = true;
    // Note: We don't reference `window` here because the navigator object also exists
    // in a Web Worker's context.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      online = false;
    }
    return online;
  }

  /**
   * Checks whether or not it is ok to retry a request.
   * @param {Error|DetailedError} err the error returned from the last request
   * @param {number} retryAttempt the number of times the request has already been retried
   * @param {object} options tus Upload options
   *
   * @api private
   */
  function shouldRetry(err, retryAttempt, options) {
    // We only attempt a retry if
    // - retryDelays option is set
    // - we didn't exceed the maxium number of retries, yet, and
    // - this error was caused by a request or it's response and
    // - the error is server error (i.e. not a status 4xx except a 409 or 423) or
    // a onShouldRetry is specified and returns true
    // - the browser does not indicate that we are offline
    if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
      return false;
    }
    if (options && typeof options.onShouldRetry === 'function') {
      return options.onShouldRetry(err, retryAttempt, options);
    }
    return defaultOnShouldRetry(err);
  }

  /**
   * determines if the request should be retried. Will only retry if not a status 4xx except a 409 or 423
   * @param {DetailedError} err
   * @returns {boolean}
   */
  function defaultOnShouldRetry(err) {
    const status = err.originalResponse ? err.originalResponse.getStatus() : 0;
    return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
  }

  /**
   * Resolve a relative link given the origin as source. For example,
   * if a HTTP request to http://example.com/files/ returns a Location
   * header with the value /upload/abc, the resolved URL will be:
   * http://example.com/upload/abc
   */
  function resolveUrl(origin, link) {
    return new URL(link, origin).toString();
  }

  /**
   * Calculate the start and end positions for the parts if an upload
   * is split into multiple parallel requests.
   *
   * @param {number} totalSize The byte size of the upload, which will be split.
   * @param {number} partCount The number in how many parts the upload will be split.
   * @return {object[]}
   * @api private
   */
  function splitSizeIntoParts(totalSize, partCount) {
    const partSize = Math.floor(totalSize / partCount);
    const parts = [];
    for (let i = 0; i < partCount; i++) {
      parts.push({
        start: partSize * i,
        end: partSize * (i + 1)
      });
    }
    parts[partCount - 1].end = totalSize;
    return parts;
  }
  BaseUpload.defaultOptions = defaultOptions$1;

  const isReactNative = () => typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';

  /**
   * uriToBlob resolves a URI to a Blob object. This is used for
   * React Native to retrieve a file (identified by a file://
   * URI) as a blob.
   */
  function uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const blob = xhr.response;
        resolve(blob);
      };
      xhr.onerror = err => {
        reject(err);
      };
      xhr.open('GET', uri);
      xhr.send();
    });
  }

  const isCordova = () => typeof window !== 'undefined' && (typeof window.PhoneGap !== 'undefined' || typeof window.Cordova !== 'undefined' || typeof window.cordova !== 'undefined');

  /**
   * readAsByteArray converts a File object to a Uint8Array.
   * This function is only used on the Apache Cordova platform.
   * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
   */
  function readAsByteArray(chunk) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = new Uint8Array(reader.result);
        resolve({
          value
        });
      };
      reader.onerror = err => {
        reject(err);
      };
      reader.readAsArrayBuffer(chunk);
    });
  }

  class FileSource {
    // Make this.size a method
    constructor(file) {
      this._file = file;
      this.size = file.size;
    }
    slice(start, end) {
      // In Apache Cordova applications, a File must be resolved using
      // FileReader instances, see
      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
      if (isCordova()) {
        return readAsByteArray(this._file.slice(start, end));
      }
      const value = this._file.slice(start, end);
      const done = end >= this.size;
      return Promise.resolve({
        value,
        done
      });
    }
    close() {
      // Nothing to do here since we don't need to release any resources.
    }
  }

  function len(blobOrArray) {
    if (blobOrArray === undefined) return 0;
    if (blobOrArray.size !== undefined) return blobOrArray.size;
    return blobOrArray.length;
  }

  /*
    Typed arrays and blobs don't have a concat method.
    This function helps StreamSource accumulate data to reach chunkSize.
  */
  function concat(a, b) {
    if (a.concat) {
      // Is `a` an Array?
      return a.concat(b);
    }
    if (a instanceof Blob) {
      return new Blob([a, b], {
        type: a.type
      });
    }
    if (a.set) {
      // Is `a` a typed array?
      const c = new a.constructor(a.length + b.length);
      c.set(a);
      c.set(b, a.length);
      return c;
    }
    throw new Error('Unknown data type');
  }
  class StreamSource {
    constructor(reader) {
      this._buffer = undefined;
      this._bufferOffset = 0;
      this._reader = reader;
      this._done = false;
    }
    slice(start, end) {
      if (start < this._bufferOffset) {
        return Promise.reject(new Error("Requested data is before the reader's current offset"));
      }
      return this._readUntilEnoughDataOrDone(start, end);
    }
    _readUntilEnoughDataOrDone(start, end) {
      const hasEnoughData = end <= this._bufferOffset + len(this._buffer);
      if (this._done || hasEnoughData) {
        const value = this._getDataFromBuffer(start, end);
        const done = value == null ? this._done : false;
        return Promise.resolve({
          value,
          done
        });
      }
      return this._reader.read().then(({
        value,
        done
      }) => {
        if (done) {
          this._done = true;
        } else if (this._buffer === undefined) {
          this._buffer = value;
        } else {
          this._buffer = concat(this._buffer, value);
        }
        return this._readUntilEnoughDataOrDone(start, end);
      });
    }
    _getDataFromBuffer(start, end) {
      // Remove data from buffer before `start`.
      // Data might be reread from the buffer if an upload fails, so we can only
      // safely delete data when it comes *before* what is currently being read.
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      }
      // If the buffer is empty after removing old data, all data has been read.
      const hasAllDataBeenRead = len(this._buffer) === 0;
      if (this._done && hasAllDataBeenRead) {
        return null;
      }
      // We already removed data before `start`, so we just return the first
      // chunk from the buffer.
      return this._buffer.slice(0, end - start);
    }
    close() {
      if (this._reader.cancel) {
        this._reader.cancel();
      }
    }
  }

  let FileReader$1 = class FileReader {
    async openFile(input, chunkSize) {
      // In React Native, when user selects a file, instead of a File or Blob,
      // you usually get a file object {} with a uri property that contains
      // a local path to the file. We use XMLHttpRequest to fetch
      // the file blob, before uploading with tus.
      if (isReactNative() && input && typeof input.uri !== 'undefined') {
        try {
          const blob = await uriToBlob(input.uri);
          return new FileSource(blob);
        } catch (err) {
          throw new Error(`tus: cannot fetch \`file.uri\` as Blob, make sure the uri is correct and accessible. ${err}`);
        }
      }

      // Since we emulate the Blob type in our tests (not all target browsers
      // support it), we cannot use `instanceof` for testing whether the input value
      // can be handled. Instead, we simply check is the slice() function and the
      // size property are available.
      if (typeof input.slice === 'function' && typeof input.size !== 'undefined') {
        return Promise.resolve(new FileSource(input));
      }
      if (typeof input.read === 'function') {
        chunkSize = Number(chunkSize);
        if (!Number.isFinite(chunkSize)) {
          return Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option'));
        }
        return Promise.resolve(new StreamSource(input, chunkSize));
      }
      return Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment'));
    }
  };

  // TODO: Differenciate between input types

  /**
   * Generate a fingerprint for a file which will be used the store the endpoint
   *
   * @param {File} file
   * @param {Object} options
   * @param {Function} callback
   */
  function fingerprint(file, options) {
    if (isReactNative()) {
      return Promise.resolve(reactNativeFingerprint(file, options));
    }
    return Promise.resolve(['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
  }
  function reactNativeFingerprint(file, options) {
    const exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
    return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
  }
  function hashCode(str) {
    // from https://stackoverflow.com/a/8831937/151666
    let hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }
    return hash;
  }

  class XHRHttpStack {
    createRequest(method, url) {
      return new Request(method, url);
    }
    getName() {
      return 'XHRHttpStack';
    }
  }
  class Request {
    constructor(method, url) {
      this._xhr = new XMLHttpRequest();
      this._xhr.open(method, url, true);
      this._method = method;
      this._url = url;
      this._headers = {};
    }
    getMethod() {
      return this._method;
    }
    getURL() {
      return this._url;
    }
    setHeader(header, value) {
      this._xhr.setRequestHeader(header, value);
      this._headers[header] = value;
    }
    getHeader(header) {
      return this._headers[header];
    }
    setProgressHandler(progressHandler) {
      // Test support for progress events before attaching an event listener
      if (!('upload' in this._xhr)) {
        return;
      }
      this._xhr.upload.onprogress = e => {
        if (!e.lengthComputable) {
          return;
        }
        progressHandler(e.loaded);
      };
    }
    send(body = null) {
      return new Promise((resolve, reject) => {
        this._xhr.onload = () => {
          resolve(new Response(this._xhr));
        };
        this._xhr.onerror = err => {
          reject(err);
        };
        this._xhr.send(body);
      });
    }
    abort() {
      this._xhr.abort();
      return Promise.resolve();
    }
    getUnderlyingObject() {
      return this._xhr;
    }
  }
  class Response {
    constructor(xhr) {
      this._xhr = xhr;
    }
    getStatus() {
      return this._xhr.status;
    }
    getHeader(header) {
      return this._xhr.getResponseHeader(header);
    }
    getBody() {
      return this._xhr.responseText;
    }
    getUnderlyingObject() {
      return this._xhr;
    }
  }

  let hasStorage = false;
  try {
    // Note: localStorage does not exist in the Web Worker's context, so we must use window here.
    hasStorage = 'localStorage' in window;

    // Attempt to store and read entries from the local storage to detect Private
    // Mode on Safari on iOS (see #49)
    // If the key was not used before, we remove it from local storage again to
    // not cause confusion where the entry came from.
    const key = 'tusSupport';
    const originalValue = localStorage.getItem(key);
    localStorage.setItem(key, originalValue);
    if (originalValue === null) localStorage.removeItem(key);
  } catch (e) {
    // If we try to access localStorage inside a sandboxed iframe, a SecurityError
    // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
    // thrown (see #49)
    if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
      hasStorage = false;
    } else {
      throw e;
    }
  }
  const canStoreURLs = hasStorage;
  class WebStorageUrlStorage {
    findAllUploads() {
      const results = this._findEntries('tus::');
      return Promise.resolve(results);
    }
    findUploadsByFingerprint(fingerprint) {
      const results = this._findEntries(`tus::${fingerprint}::`);
      return Promise.resolve(results);
    }
    removeUpload(urlStorageKey) {
      localStorage.removeItem(urlStorageKey);
      return Promise.resolve();
    }
    addUpload(fingerprint, upload) {
      const id = Math.round(Math.random() * 1e12);
      const key = `tus::${fingerprint}::${id}`;
      localStorage.setItem(key, JSON.stringify(upload));
      return Promise.resolve(key);
    }
    _findEntries(prefix) {
      const results = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.indexOf(prefix) !== 0) continue;
        try {
          const upload = JSON.parse(localStorage.getItem(key));
          upload.urlStorageKey = key;
          results.push(upload);
        } catch (_e) {
          // The JSON parse error is intentionally ignored here, so a malformed
          // entry in the storage cannot prevent an upload.
        }
      }
      return results;
    }
  }

  const defaultOptions = {
    ...BaseUpload.defaultOptions,
    httpStack: new XHRHttpStack(),
    fileReader: new FileReader$1(),
    urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
    fingerprint
  };
  class Upload extends BaseUpload {
    constructor(file = null, options = {}) {
      options = {
        ...defaultOptions,
        ...options
      };
      super(file, options);
    }
    static terminate(url, options = {}) {
      options = {
        ...defaultOptions,
        ...options
      };
      return BaseUpload.terminate(url, options);
    }
  }

  const deleteUpload = async (url, csrfToken) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.onload = () => {
      if (xhr.status === 204) {
        resolve();
      } else {
        reject(new Error());
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("X-CSRFToken", csrfToken);
    xhr.send(null);
  });

  class TusUpload extends BaseUpload$1 {
    constructor({
      chunkSize,
      csrfToken,
      fieldName,
      file,
      formId,
      retryDelays,
      uploadIndex,
      uploadUrl
    }) {
      super({
        name: file.name,
        status: "uploading",
        type: "tus",
        uploadIndex
      });
      this.csrfToken = csrfToken;
      this.upload = new Upload(file, {
        chunkSize,
        endpoint: uploadUrl,
        metadata: {
          fieldName: fieldName,
          filename: file.name,
          formId: formId
        },
        onAfterResponse: this.handleAfterReponse,
        onBeforeRequest: this.addCsrTokenToRequest,
        onError: this.handleError,
        onProgress: this.handleProgress,
        onSuccess: this.handleSucces,
        retryDelays: retryDelays ?? [0, 1000, 3000, 5000]
      });
      this.onError = undefined;
      this.onProgress = undefined;
      this.onSuccess = undefined;
    }
    async abort() {
      await this.upload.abort(true);
    }
    async delete() {
      if (!this.upload.url) {
        return Promise.resolve();
      }
      await deleteUpload(this.upload.url, this.csrfToken);
    }
    getId() {
      return this.id;
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.name,
        size: this.getSize(),
        type: "tus",
        url: ""
      };
    }
    getSize() {
      return this.upload.file.size;
    }
    start() {
      this.upload.start();
    }
    addCsrTokenToRequest = request => {
      request.setHeader("X-CSRFToken", this.csrfToken);
    };
    handleAfterReponse = (_request, response) => {
      const resourceId = response.getHeader("ResourceId");
      if (resourceId) {
        this.id = resourceId;
      }
    };
    handleError = error => {
      if (this.onError) {
        this.onError(error);
      } else {
        throw error;
      }
    };
    handleProgress = (bytesUploaded, bytesTotal) => {
      if (this.onProgress) {
        this.onProgress(bytesUploaded, bytesTotal);
      }
    };
    handleSucces = () => {
      if (this.onSuccess) {
        this.onSuccess();
      }
    };
  }

  class BaseUploadedFile extends BaseUpload$1 {
    constructor({
      name,
      size,
      type,
      uploadIndex
    }) {
      super({
        name,
        status: "done",
        type,
        uploadIndex
      });
      this.size = size;
    }
    async abort() {
      return Promise.resolve();
    }
    async delete() {
      return Promise.resolve();
    }
    getSize() {
      return this.size;
    }
  }
  class PlaceholderFile extends BaseUploadedFile {
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "placeholder",
        uploadIndex
      });
      this.id = initialFile.id;
    }
    getId() {
      return undefined;
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.name,
        size: this.size,
        type: "placeholder"
      };
    }
  }
  class ExistingFile extends BaseUploadedFile {
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "existing",
        uploadIndex
      });
    }
    getId() {
      return undefined;
    }
    getInitialFile() {
      return {
        name: this.name,
        size: this.size,
        type: "existing"
      };
    }
  }
  class UploadedS3File extends BaseUploadedFile {
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.original_name || initialFile.name,
        size: initialFile.size,
        type: "uploadedS3",
        uploadIndex
      });
      this.id = initialFile.id;
      this.key = initialFile.name;
    }
    getId() {
      return this.id;
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.key,
        original_name: this.name,
        size: this.size,
        type: "s3"
      };
    }
  }
  class UploadedTusFile extends BaseUploadedFile {
    constructor({
      csrfToken,
      initialFile,
      uploadIndex,
      uploadUrl
    }) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "uploadedTus",
        uploadIndex
      });
      this.csrfToken = csrfToken;
      this.id = initialFile.id;
      this.url = `${uploadUrl}${initialFile.id}`;
    }
    async delete() {
      await deleteUpload(this.url, this.csrfToken);
    }
    getId() {
      return this.id;
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.name,
        size: this.size,
        type: "tus",
        url: ""
      };
    }
  }
  const createUploadedFile = ({
    csrfToken,
    initialFile,
    uploadIndex,
    uploadUrl
  }) => {
    switch (initialFile.type) {
      case "existing":
        return new ExistingFile(initialFile, uploadIndex);
      case "placeholder":
        return new PlaceholderFile(initialFile, uploadIndex);
      case "s3":
        return new UploadedS3File(initialFile, uploadIndex);
      case "tus":
        return new UploadedTusFile({
          csrfToken,
          initialFile,
          uploadIndex,
          uploadUrl
        });
    }
  };

  class FileField {
    constructor({
      callbacks,
      chunkSize,
      csrfToken,
      eventEmitter,
      fieldName,
      form,
      formId,
      initial,
      input,
      multiple,
      parent,
      prefix,
      retryDelays,
      s3UploadDir,
      skipRequired,
      supportDropArea,
      translations,
      uploadUrl
    }) {
      this.callbacks = callbacks;
      this.chunkSize = chunkSize;
      this.csrfToken = csrfToken;
      this.eventEmitter = eventEmitter;
      this.fieldName = fieldName;
      this.form = form;
      this.formId = formId;
      this.multiple = multiple;
      this.prefix = prefix;
      this.retryDelays = retryDelays;
      this.s3UploadDir = s3UploadDir;
      this.supportDropArea = supportDropArea && !input.disabled;
      this.uploadUrl = uploadUrl;
      this.acceptedFileTypes = new AcceptedFileTypes(input.accept);
      this.uploads = [];
      this.nextUploadIndex = 0;
      this.renderer = new RenderUploadFile({
        input,
        parent,
        skipRequired,
        translations
      });
      const filesContainer = this.renderer.container;
      if (supportDropArea) {
        this.initDropArea(filesContainer, input.accept);
      }
      this.addInitialFiles(initial);
      this.checkDropHint();
      input.addEventListener("change", this.onChange);
      filesContainer.addEventListener("click", this.handleClick);
    }
    addInitialFiles(initialFiles) {
      if (initialFiles.length === 0) {
        return;
      }
      const {
        multiple,
        renderer
      } = this;
      const addInitialFile = initialFile => {
        const {
          size
        } = initialFile;
        const name = initialFile.type === "s3" && initialFile.original_name ? initialFile.original_name : initialFile.name;
        const element = renderer.addUploadedFile(name, this.nextUploadIndex, size);
        const upload = createUploadedFile({
          csrfToken: this.csrfToken,
          initialFile,
          uploadIndex: this.nextUploadIndex,
          uploadUrl: this.uploadUrl
        });
        this.uploads.push(upload);
        this.emitEvent("addUpload", element, upload);
      };
      if (multiple) {
        initialFiles.forEach(file => {
          addInitialFile(file);
          this.nextUploadIndex += 1;
        });
      } else {
        const initialFile = initialFiles[0];
        if (initialFile) {
          addInitialFile(initialFile);
        }
      }
    }
    checkDropHint() {
      if (!this.supportDropArea) {
        return;
      }
      const nonEmptyUploads = this.uploads.filter(e => Boolean(e));
      if (nonEmptyUploads.length === 0) {
        this.renderer.renderDropHint();
      } else {
        this.renderer.removeDropHint();
      }
    }
    emitEvent(eventName, element, upload) {
      if (this.eventEmitter) {
        this.eventEmitter.emit(eventName, {
          element,
          fieldName: this.fieldName,
          fileName: upload.name,
          metaDataField: this.getMetaDataField(),
          upload
        });
      }
    }
    findUploadByName(fileName) {
      return this.uploads.find(upload => upload.name === fileName);
    }
    getMetaDataField() {
      return findInput(this.form, getMetadataFieldName(this.fieldName, this.prefix), this.prefix);
    }
    getUploadByIndex(uploadIndex) {
      return this.uploads.find(upload => upload.uploadIndex === uploadIndex);
    }
    async handleCancel(upload) {
      this.renderer.disableCancel(upload.uploadIndex);
      await upload.abort();
      this.removeUploadFromList(upload);
    }
    handleClick = e => {
      const target = e.target;
      const getUpload = () => {
        const dataIndex = target.getAttribute("data-index");
        if (!dataIndex) {
          return undefined;
        }
        const uploadIndex = parseInt(dataIndex, 10);
        return this.getUploadByIndex(uploadIndex);
      };
      if (target.classList.contains("dff-delete") && !target.classList.contains("dff-disabled")) {
        e.preventDefault();
        const upload = getUpload();
        if (upload) {
          void this.removeExistingUpload(upload);
        }
      } else if (target.classList.contains("dff-cancel")) {
        e.preventDefault();
        const upload = getUpload();
        if (upload) {
          void this.handleCancel(upload);
        }
      } else if (target.classList.contains("dff-filename")) {
        e.preventDefault();
        const upload = getUpload();
        if (upload?.status === "done" && this.callbacks.onClick) {
          this.callbacks.onClick({
            fieldName: this.fieldName,
            fileName: upload.name,
            id: upload.getId(),
            type: upload.type
          });
        }
      }
    };
    handleError = (upload, error) => {
      this.renderer.setError(upload.uploadIndex);
      upload.status = "error";
      const {
        onError
      } = this.callbacks;
      if (onError) {
        if (upload instanceof TusUpload) {
          onError(error, upload);
        }
      }
    };
    handleInvalidFiles = files => {
      this.renderer.setErrorInvalidFiles(files);
    };
    handleProgress = (upload, bytesUploaded, bytesTotal) => {
      const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      this.renderer.updateProgress(upload.uploadIndex, percentage);
      const {
        onProgress
      } = this.callbacks;
      if (onProgress) {
        if (upload instanceof TusUpload) {
          onProgress(bytesUploaded, bytesTotal, upload);
        }
      }
    };
    handleSuccess = upload => {
      const {
        renderer
      } = this;
      this.updatePlaceholderInput();
      renderer.clearInput();
      renderer.setSuccess(upload.uploadIndex, upload.getSize());
      upload.status = "done";
      const {
        onSuccess
      } = this.callbacks;
      const element = this.renderer.findFileDiv(upload.uploadIndex);
      if (element) {
        this.emitEvent("uploadComplete", element, upload);
      }
      if (onSuccess && upload.type === "tus") {
        onSuccess(upload);
      }
    };
    initDropArea(container, inputAccept) {
      new DropArea({
        container,
        inputAccept,
        onUploadFiles: this.uploadFiles,
        renderer: this.renderer
      });
    }
    onChange = e => {
      const files = e.target.files ?? [];
      const acceptedFiles = [];
      const invalidFiles = [];
      for (const file of files) {
        if (this.acceptedFileTypes.isAccepted(file.name)) {
          acceptedFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      }
      this.handleInvalidFiles([...invalidFiles]);
      void this.uploadFiles([...acceptedFiles]);
      this.renderer.clearInput();
    };
    async removeExistingUpload(upload) {
      const element = this.renderer.findFileDiv(upload.uploadIndex);
      if (element) {
        this.emitEvent("removeUpload", element, upload);
      }
      if (upload.status === "uploading") {
        this.renderer.disableCancel(upload.uploadIndex);
        await upload.abort();
      } else if (upload.status === "done") {
        this.renderer.disableDelete(upload.uploadIndex);
        try {
          await upload.delete();
        } catch {
          this.renderer.setDeleteFailed(upload.uploadIndex);
          return;
        }
      }
      this.removeUploadFromList(upload);
      this.updatePlaceholderInput();
    }
    removeUploadFromList(upload) {
      this.renderer.deleteFile(upload.uploadIndex);
      const index = this.uploads.indexOf(upload);
      if (index >= 0) {
        this.uploads.splice(index, 1);
      }
      this.checkDropHint();
      const {
        onDelete
      } = this.callbacks;
      if (onDelete) {
        onDelete(upload);
      }
    }
    updatePlaceholderInput() {
      const input = findInput(this.form, getUploadsFieldName(this.fieldName, this.prefix), this.prefix);
      if (!input) {
        return;
      }
      const placeholdersInfo = this.uploads.map(upload => upload.getInitialFile());
      input.value = JSON.stringify(placeholdersInfo);
    }
    async uploadFile(file) {
      const createUpload = () => {
        const {
          csrfToken,
          s3UploadDir
        } = this;
        if (s3UploadDir != null) {
          return new S3Upload({
            csrfToken,
            endpoint: uploadUrl,
            file,
            s3UploadDir,
            uploadIndex: newUploadIndex
          });
        } else {
          return new TusUpload({
            chunkSize: this.chunkSize,
            csrfToken: this.csrfToken,
            fieldName,
            file,
            formId,
            retryDelays: this.retryDelays,
            uploadIndex: newUploadIndex,
            uploadUrl
          });
        }
      };
      const {
        fieldName,
        formId,
        renderer,
        uploadUrl
      } = this;
      const fileName = file.name;
      const existingUpload = this.findUploadByName(fileName);
      const newUploadIndex = existingUpload ? existingUpload.uploadIndex : this.nextUploadIndex;
      if (!existingUpload) {
        this.nextUploadIndex += 1;
      }
      if (existingUpload) {
        await this.removeExistingUpload(existingUpload);
      }
      const upload = createUpload();
      upload.onError = error => {
        this.handleError(upload, error);
      };
      upload.onProgress = (bytesUploaded, bytesTotal) => {
        this.handleProgress(upload, bytesUploaded, bytesTotal);
      };
      upload.onSuccess = () => {
        this.handleSuccess(upload);
      };
      upload.start();
      this.uploads.push(upload);
      const element = renderer.addNewUpload(fileName, newUploadIndex);
      this.emitEvent("addUpload", element, upload);
    }
    uploadFiles = async files => {
      if (files.length === 0) {
        return;
      }
      if (!this.multiple) {
        for (const upload of this.uploads) {
          this.renderer.deleteFile(upload.uploadIndex);
        }
        this.uploads = [];
        const file = files[0];
        if (file) {
          await this.uploadFile(file);
        }
      } else {
        for (const file of files) {
          await this.uploadFile(file);
        }
      }
      this.checkDropHint();
    };
  }

  const initUploadFields = (form, options = {}) => {
    const matchesPrefix = fieldName => {
      if (!options.prefix) {
        return true;
      }
      return fieldName.startsWith(`${options.prefix}-`);
    };
    const getPrefix = () => options.prefix ?? null;
    const getInputValue = fieldName => getInputValueForFormAndPrefix(form, fieldName, getPrefix());
    const getInitialFiles = fieldName => {
      const data = getInputValue(getUploadsFieldName(fieldName, getPrefix()));
      if (!data) {
        return [];
      }
      return JSON.parse(data).filter(file => file.type);
    };
    const uploadUrl = getInputValue("upload_url");
    const formId = getInputValue("form_id");
    const s3UploadDir = getInputValue("s3_upload_dir");
    const skipRequired = options.skipRequired ?? false;
    const prefix = getPrefix();
    const csrfToken = findInput(form, "csrfmiddlewaretoken", null)?.value;
    if (!csrfToken) {
      throw Error("Csrf token not found");
    }
    if (!formId || !uploadUrl) {
      return;
    }
    form.querySelectorAll(".dff-uploader").forEach(uploaderDiv => {
      const container = uploaderDiv.querySelector(".dff-container");
      if (!container) {
        return;
      }
      const input = container.querySelector("input[type=file]");
      if (!(input && matchesPrefix(input.name))) {
        return;
      }
      const fieldName = input.name;
      const {
        multiple
      } = input;
      const initial = getInitialFiles(fieldName);
      const dataTranslations = container.getAttribute("data-translations");
      const translations = dataTranslations ? JSON.parse(dataTranslations) : {};
      const supportDropArea = !(options.supportDropArea === false);
      new FileField({
        callbacks: options.callbacks ?? {},
        chunkSize: options.chunkSize ?? 2621440,
        csrfToken,
        eventEmitter: options.eventEmitter,
        fieldName,
        form,
        formId,
        initial,
        input,
        multiple,
        parent: container,
        prefix,
        retryDelays: options.retryDelays ?? null,
        s3UploadDir: s3UploadDir ?? null,
        skipRequired,
        supportDropArea,
        translations,
        uploadUrl
      });
    });
  };

  const initFormSet = (form, optionsParam) => {
    let options;
    if (typeof optionsParam === "string") {
      options = {
        prefix: optionsParam
      };
    } else {
      options = optionsParam;
    }
    const prefix = options.prefix ?? "form";
    const totalFormsValue = getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix);
    if (!totalFormsValue) {
      return;
    }
    const formCount = parseInt(totalFormsValue, 10);
    for (let i = 0; i < formCount; i += 1) {
      const subFormPrefix = getInputNameWithPrefix(i.toString(), null);
      initUploadFields(form, {
        ...options,
        prefix: `${prefix}-${subFormPrefix}`
      });
    }
  };

  // eslint-disable-line @typescript-eslint/no-explicit-any

  window.autoInitFileForms = autoInitFileForms; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
  window.initFormSet = initFormSet; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
  window.initUploadFields = initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

})();
//# sourceMappingURL=file_form.js.map
