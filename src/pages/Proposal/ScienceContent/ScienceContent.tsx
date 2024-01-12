import React from 'react';
import {
    Box,
    Grid,
    Typography
} from '@mui/material';
import UploadPdfButton from '../../../components/button/uploadPdf/UploadPdfButton';

import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import UploadPdfAlertDialog from "../../../components/button/uploadPdf/UploadPdfAlertDialog";

interface ScienceContentProps {
    page: number;
    setStatus: Function;
}

export default function ScienceContentProps({ page, setStatus }: ScienceContentProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (typeof setStatus !== 'function') {
            return;
        }
        const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
        const count = 0;

        // TODO : Increment the count for every passing element of the page.
        // This is then used to take the status from the result array
        // In the default provided, the count must be 2 for the page to pass.

        // See titleContent page for working example

        setStatus([page, result[count]]);
    }, [setStatus]);

    const handleDialogResponse = response => {
        if (response === 'continue') {
            console.log('BUTTON CLICKED 1');
        } else {
            console.log('BUTTON CLICKED 2');
        }
    }

    function openModal() {
        setIsOpen(true);
    }

    const func = () => {
        openModal();
    }

    return (
        <>
            <UploadPdfAlertDialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                onDialogResponse={handleDialogResponse}
            />
            <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
                <Grid item>
                    <Grid container p={5} spacing={5} direction="row" justifyContent="space-evenly">
                        <Grid item xs={6}>
                            <Grid container direction="column" alignItems="left">
                                <Typography variant="h5">Upload PDF</Typography>
                                <Grid container direction="row" justifyContent="space-between">
                                    <UploadPdfButton func={func} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Box m={1}>
                                <Typography variant="h5">Preview Uploaded PDF</Typography>
                                {/* TODO : Need React version of this <Latex>{latex}</Latex>  */}
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
