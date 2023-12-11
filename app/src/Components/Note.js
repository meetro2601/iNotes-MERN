import { MDBCard, MDBCollapse, MDBIcon, MDBTooltip } from 'mdb-react-ui-kit'
import React, { useState } from 'react'

function Note({ detail, onEdit, onDelete, onToggle, isActive = false, multiple = false }) {
    const [collapse, setCollapse] = useState(false)


    const toggleMultiple = (id) => {
        setCollapse(collapse => !collapse)
    }


    return (
        <div className='border border-dark rounded-3'>
            <MDBCard  className="bg-light py-2 pe-4 rounded-3 d-flex flex-row border gap-3 justify-content-between align-items-center cardHover">
                <button disabled={detail.description == "" && true} onClick={() => {multiple ? toggleMultiple() : onToggle(detail._id) }}
                className="w-100 text-dark text-start text-nowrap bg-transparent py-2 px-4 border-0 fs-5 overflow-hidden text-truncate">{detail.title}</button>
                <p className="text-nowrap mb-0 date">{detail.date}</p>
                <div className="actions">
                    <MDBTooltip wrapperClass="bg-transparent px-0 border-0 shadow-none" title="Edit">
                    <div
                        onClick={() => onEdit(detail._id)}
                        >
                        <MDBIcon style={{ color: "#8f5fff",fontSize:18 }} icon='edit'></MDBIcon>
                    </div>
                        </MDBTooltip>
                        <MDBTooltip wrapperClass="bg-transparent px-0 border-0 shadow-none" title="Delete">
                    <div
                        onClick={() => onDelete(detail._id)}
                        >
                        <MDBIcon style={{ color: "#fe4757",fontSize:18 }} icon='trash-alt'></MDBIcon>
                    </div>
                        </MDBTooltip>
                </div>
            </MDBCard>
            {
                detail.description != "" &&
            <MDBCollapse show={multiple ? collapse : isActive}>
               <p className='px-4 py-3 mb-0'> {detail.description}</p>
            </MDBCollapse>
            }
        </div>
    )
}

export default Note