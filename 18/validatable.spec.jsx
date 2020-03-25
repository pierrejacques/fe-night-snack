import React from 'react';
import { shallow } from 'enzyme';
import { ValidatableInput } from './validatable-input';

describe('测试 ValidatableInput', () => {
  test('失焦时触发 onValidate', () => {
    const onValidate = jest.mock();
    const inputValue = '输入的内容';
    const wrapper = shallow(
      <ValidatableInput
        placeholder={''}
        value={inputValue}
        alert={''}
        onChange={onChange}
        onValidate={onValidate}
      />
    );

    wrapper.find('.c-input-with-alert__input').first().simulate('blur');
    expect(onValidate).toBeCalledWith(inputValue);
  });
})
