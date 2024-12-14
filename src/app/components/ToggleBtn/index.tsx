import React from 'react';
import './styles.css';

const ToggleBtn = ({ text1, text2, value, toggleValue, id }) => {
    return (
        <div className="toggleBtnWrapper">
            <div className="toggleText">{text1}</div>
            <div className="toggleBtn">
                <input
                    type="checkbox"
                    id={`checkbox-${id}`}
                    checked={value}
                    onChange={toggleValue}
                />
                <label className="toggleLabel" htmlFor={`checkbox-${id}`} id={`checkbox-${id}`} />
            </div>
            <div className="toggleText">{text2}</div>
        </div>
    )
}

export default ToggleBtn;
