import test from 'ava';

const objc = require('./src/index.js');

test('string creation', t => {
  const NSString = objc.NSString;
  const string = NSString.stringWithString_('Hello World');
  t.is(String(string), 'Hello World');
});

test('primitive return values', t => {
  const NSString = objc.NSString;
  const string = NSString.stringWithString_('I am the doctor');
  const length = string.length();
  t.is(length, 15);
  t.is(typeof length, 'number');
});

test('load constant directly from `objc` module', t => {
  objc.import('AppKit');
  const NSFontAttributeName = objc.NSFontAttributeName;

  t.is(NSFontAttributeName, 'NSFont');
});

test('load constant w/out bundle', t => {
  objc.import('AppKit');
  const NSFontAttributeName = objc.constant('NSFontAttributeName');

  t.is(NSFontAttributeName, 'NSFont');
});

test('load constant w/ bundle', t => {
  objc.import('AppKit');
  const NSFontAttributeName = objc.constant('NSFontAttributeName', 'AppKit');

  t.is(NSFontAttributeName, 'NSFont');
});

test('load constant w/ full bundle name', t => {
  objc.import('AppKit');
  const NSFontAttributeName = objc.constant('NSFontAttributeName', 'com.apple.AppKit');

  t.is(NSFontAttributeName, 'NSFont');
});

test('get username using NSProcessInfo, convert to javascript string and compare the value to the username given by `os.userInfo()`', t => {
  const NSProcessInfo = objc.NSProcessInfo;
  const os = require('os');

  const processInfo = NSProcessInfo.processInfo();
  const username = processInfo.userName();

  t.is(String(username), os.userInfo().username);
});

test('primitive argument types', t => {
  const NSNumber = objc.NSNumber;

  const number = NSNumber.numberWithInt_(5);

  t.is(Number(number), 5);
});

test('inout parameters 1 (^@)', t => {
  const NSFileManager = objc.NSFileManager;
  const fm = NSFileManager.defaultManager();

  const filepath = '/Library/Caches/randomfilenamethatsurelydoesntexust.hey';
  fm.createFileAtPath_contents_attributes_(filepath, null, null);

  const error1 = objc.ref(null);
  const success1 = fm.removeItemAtPath_error_(filepath, error1);

  t.is(success1, true);
  t.is(typeof objc.deref(error1), 'undefined');

  const error2 = objc.ref(null);
  const success2 = fm.removeItemAtPath_error_(filepath, error2);

  t.is(success2, false);
  t.is(typeof objc.deref(error2), 'object');
});

test('inout parameters 2 (^@)', t => {
  const NSDictionary = objc.NSDictionary;
  const NSAppleScript = objc.NSAppleScript;
  const source = 'telll application "Safari" to get URL of current tab of window 1';

  const script = NSAppleScript.alloc().initWithSource_(source);

  const error = objc.ref(null);
  const success = script.compileAndReturnError_(error);

  t.is(success, false);
  t.is(objc.deref(error).isKindOfClass_(NSDictionary), true);
});

test('Automatic array conversion (JS array -> NSArray)', t => {
  const NSArray = objc.NSArray;

  const inputArray = ['I', 'am', 'the', 'doctor'];
  const array = NSArray.arrayWithArray_(inputArray);

  inputArray.forEach((object, index) => {
    const str1 = String(object);
    const str2 = String(array.objectAtIndex_(index));
    t.is(str1, str2);
  });
});

test('Iterate over a NSArray', t => {
  const NSArray = objc.NSArray;

  const inputArray = ['hey', 'missy', 'you', 'so', 'fine'];
  const array = NSArray.arrayWithArray_(inputArray);

  for (const element of array) {
    const index = inputArray.indexOf(String(element));
    inputArray.splice(index, 1);
  }

  t.is(inputArray.length, 0);
});

test('Test calling methods that contain underscores', t => {
  const NSDate = objc.NSDate;

  const now = NSDate.date();
  const web_RFC1123DateString = now._web_RFC1123DateString(); // eslint-disable-line camelcase

  t.is(typeof web_RFC1123DateString, 'object'); // eslint-disable-line camelcase
  t.is(web_RFC1123DateString.isKindOfClass_('NSString'), true); // eslint-disable-line camelcase
});

test('Test possible selectors for 0 underscores', t => {
  const possibleSelectors = require('./src/possible-selectors');

  const selectors = ['date'];

  possibleSelectors('date').forEach((_, index) => {
    selectors.splice(index, 1);
  });

  t.is(selectors.length, 0);
});

test('Test possible selectors for 1 underscore', t => {
  const possibleSelectors = require('./src/possible-selectors');

  const selectors = [
    'performAction:',
    'performAction_'
  ];

  possibleSelectors('performAction_').forEach(sel => {
    const index = selectors.indexOf(sel);
    selectors.splice(index, 1);
  });

  t.is(selectors.length, 0);
});

test('Test possible selectors for 2 underscores', t => {
  const possibleSelectors = require('./src/possible-selectors');

  const selectors = [
    'performAction_withObject_',
    'performAction:withObject_',
    'performAction_withObject:',
    'performAction:withObject:'
  ];

  possibleSelectors('performAction_withObject_').forEach(sel => {
    const index = selectors.indexOf(sel);
    selectors.splice(index, 1);
  });

  t.is(selectors.length, 0);
});

test('Test possible selectors for 3 underscores', t => {
  const possibleSelectors = require('./src/possible-selectors');

  const selectors = [
    'performAction:withObject_afterDelay:',
    'performAction:withObject_afterDelay_',
    'performAction:withObject:afterDelay_',
    'performAction_withObject:afterDelay:',
    'performAction_withObject:afterDelay_',
    'performAction_withObject_afterDelay:',
    'performAction:withObject:afterDelay:',
    'performAction_withObject_afterDelay_'
  ];

  possibleSelectors('performAction_withObject_afterDelay_').forEach(sel => {
    const index = selectors.indexOf(sel);
    selectors.splice(index, 1);
  });

  t.is(selectors.length, 0);
});

test('Test possible selectors for method with leading underscore and no other underscores', t => {
  const possibleSelectors = require('./src/possible-selectors');

  const selectors = [
    '_dateString',
    '_dateString'
  ];

  possibleSelectors('_dateString').forEach(sel => {
    const index = selectors.indexOf(sel);
    selectors.splice(index, 1);
  });

  t.is(selectors.length, 0);
});

test('Test possible selectors for method with leading underscore and other underscores', t => {
  const possibleSelectors = require('./src/possible-selectors');

  const selectors = [
    '_dateStringForTimeZone_',
    '_dateStringForTimeZone:',
    ':dateStringForTimeZone_',
    ':dateStringForTimeZone:'
  ];

  possibleSelectors('_dateStringForTimeZone_').forEach(sel => {
    const index = selectors.indexOf(sel);
    selectors.splice(index, 1);
  });

  t.is(selectors.length, 0);
});
