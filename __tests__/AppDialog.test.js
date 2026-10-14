/**
 * @format
 */
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ReactTestRenderer from 'react-test-renderer';
import {AppDialog} from '../src/components/AppDialog';
import {AppProvider} from '../src/context/AppContext';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: async key => store[key] ?? null,
      setItem: async (key, value) => {
        store[key] = value;
      },
      removeItem: async key => {
        delete store[key];
      },
    },
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

const initialMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function wrap(ui) {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AppProvider>{ui}</AppProvider>
    </SafeAreaProvider>
  );
}

function texts(root) {
  return root.root
    .findAll(node => node.type === 'Text')
    .map(node => node.props.children)
    .flat()
    .filter(child => typeof child === 'string');
}

test('confirmDelete shows title, message, cancel and confirm', async () => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      wrap(
        <AppDialog
          visible
          variant="confirmDelete"
          title="ဒေါင်းလုဒ် ဖျက်မည်လား"
          message="သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။"
          confirmLabel="ဖျက်မည်"
          cancelLabel="မလုပ်တော့"
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      ),
    );
  });
  const labels = texts(root);
  expect(labels).toEqual(
    expect.arrayContaining([
      'ဒေါင်းလုဒ် ဖျက်မည်လား',
      'သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။',
      'မလုပ်တော့',
      'ဖျက်မည်',
    ]),
  );

  const confirm = root.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === 'ဖျက်မည်',
  );
  await ReactTestRenderer.act(async () => {
    confirm.props.onPress();
  });
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('confirmDelete cancel calls onClose only', async () => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      wrap(
        <AppDialog
          visible
          variant="confirmDelete"
          title="ဒေါင်းလုဒ် ဖျက်မည်လား"
          message="သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။"
          confirmLabel="ဖျက်မည်"
          cancelLabel="မလုပ်တော့"
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      ),
    );
  });
  const cancel = root.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === 'မလုပ်တော့',
  );
  await ReactTestRenderer.act(async () => {
    cancel.props.onPress();
  });
  expect(onConfirm).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('downloadFailed shows only dismiss action', async () => {
  const onClose = jest.fn();
  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      wrap(
        <AppDialog
          visible
          variant="downloadFailed"
          title="ဒေါင်းလုဒ် မအောင်မြင်ပါ"
          onClose={onClose}
        />,
      ),
    );
  });
  const labels = texts(root);
  expect(labels).toEqual(expect.arrayContaining(['ဒေါင်းလုဒ် မအောင်မြင်ပါ', 'OK']));
  expect(labels).not.toEqual(expect.arrayContaining(['မလုပ်တော့']));

  const dismiss = root.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === 'OK',
  );
  await ReactTestRenderer.act(async () => {
    dismiss.props.onPress();
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

