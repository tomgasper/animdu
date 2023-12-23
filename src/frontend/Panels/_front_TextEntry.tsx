import React from "react";

export const _front_TextEntry  = ({name, value}) => {
    return (
        <div className="TextEntry_container">
            <div className="TextEntry_left">{name}</div>
            <div className="TextEntry_right">{value}</div>
        </div>
    )
}