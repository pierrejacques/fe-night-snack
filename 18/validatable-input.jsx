import React from 'react';

export const ValidatableInput = ({ value, placeholder, alert, onChange, onValidate }) => {
  let inputClassName = 'c-input-with-alert__input'

  if (alert) {
    inputClassName += ' c-input-with-alert__input--alert'
  }

  const alertElement = alert ? (
    <p className="c-input-with-alert__alert" >{alert}</p>
  ) : null

  return (
    <div className="c-input-with-alert">
      <Input
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onValidate}
      />
      { alertElement }
    </div>
  )
}
