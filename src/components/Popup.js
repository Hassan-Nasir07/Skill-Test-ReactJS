import React from "react";
import PropTypes from "prop-types";

const Popup = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-light">
          <div className="modal-body p-4">
            {children}
          </div>
          <div className="modal-footer justify-content-center border-0">
            <button
              type="button"
              className="btn btn-primary btn-lg px-4"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default Popup;
