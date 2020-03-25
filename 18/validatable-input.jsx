import React from 'react';

export const ValidatableInput = ({ value, placeholder, alert, onChange, onValidate }) => {
  let inputClassName = 'validatable-input__input'

  if (alert) {
    inputClassName += ' validatable-input__input--alert'
  }

  const alertElement = alert ? (
    <p className="validatable-input__alert" >{alert}</p>
  ) : null

  return (
    <div className="validatable-input">
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
