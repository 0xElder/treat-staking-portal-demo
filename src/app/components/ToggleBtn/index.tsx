import React from 'react';
import './styles.css';

const ToggleBtn = ({ text, value, toggleValue, id }) => {
    return (
        <div className="toggleBtnWrapper">
            <div className="toggleBtn">
                <input
                    type="checkbox"
                    id={`checkbox-${id}`}
                    checked={value}
                    onChange={toggleValue}
                />
                <label className="toggleLabel" htmlFor={`checkbox-${id}`} id={`checkbox-${id}`} />
            </div>
            <div className="toggleText">{text}</div>
        </div>
    )
}

export default ToggleBtn;