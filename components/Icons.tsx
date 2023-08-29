import * as React from 'react'

const CheckIcon = (props) => {
	return (
		<svg {...props} id="i-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    		<path d="M2 20 L12 28 30 4" />
		</svg>
	);
}
const FileIcon = (props) => {
	return (
		<svg {...props} id="i-file" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    		<path d="M6 2 L6 30 26 30 26 10 18 2 Z M18 2 L18 10 26 10" />
		</svg>
	);
}

export { CheckIcon, FileIcon }
