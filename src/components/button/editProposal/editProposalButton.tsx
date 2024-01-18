import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { EditRounded } from '@mui/icons-material';
import editProposal from '../../../services/axios/editProposal/editProposal';

export default function EditProposalButton() {
  const clickFunction = async () => {
    // TODO : Need to retrieve proposal content properly
    const updatedProposal = {
      /*
      ...proposal,
      title,
      description
      */
    };
    const proposal = {
      id: 1
    }
    const response = await editProposal(proposal.id, updatedProposal);
    if (response && !response.error) {
      // Handle successful response
      console.log('success');
    } else {
      // Handle error response
      console.log('error', response.error);
    }
  };

  return (
    <Tooltip title="Edit Proposal" arrow>
      <IconButton aria-label="edit" onClick={clickFunction} style={{ cursor: 'pointer' }}>
        <EditRounded />
      </IconButton>
    </Tooltip>
  );
}
