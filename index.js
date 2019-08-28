import Cleave from 'cleave.js/react';
import React, { Component } from 'react';
import InputDate from '@volenday/input-date';
import validate from 'validate.js';
import { Button, Form, InputNumber, Popover } from 'antd';

import './styles.css';

export default class InputNumber2 extends Component {
	initialState = { errors: [], hasChange: false, isPopoverVisible: false, localValue: '', isFocused: false };
	state = { ...this.initialState, initialState: this.initialState };

	static getDerivedStateFromProps(nextProps, prevState) {
		// Set initial localValue
		if (nextProps.value && !prevState.localValue) {
			return { ...prevState, localValue: nextProps.value };
		}

		// Resets equivalent value
		if (prevState.localValue !== nextProps.value) {
			// For Add
			if (typeof nextProps.value === 'undefined' && !prevState.hasChange && !prevState.isFocused) {
				return { ...prevState.initialState };
			}

			// For Edit
			if (!prevState.isFocused) {
				return { ...prevState.initialState, localValue: nextProps.value };
			}
		}

		return null;
	}

	onChange = async value => {
		const { localValue } = this.state;
		const { action, id, onChange, onValidate } = this.props;

		if (localValue != '' && value == '') onChange(id, value);
		const errors = this.validate(value);
		await this.setState({ errors, localValue: value, hasChange: action === 'add' ? false : true });
		if (onValidate) onValidate(id, errors);
	};

	validate = value => {
		const { id, maximum, minimum, required = false } = this.props;

		const constraints = {
			[id]: {
				numericality: {
					onlyInteger: true,
					greaterThanOrEqualTo: parseInt(minimum),
					lessThanOrEqualTo: parseInt(maximum)
				},
				presence: { allowEmpty: !required }
			}
		};

		const errors = validate({ [id]: value }, constraints);
		return errors ? errors[id] : [];
	};

	handlePopoverVisible = visible => {
		this.setState({ isPopoverVisible: visible });
	};

	renderInput() {
		const { localValue } = this.state;
		const {
			disabled = false,
			format = [],
			id,
			label = '',
			onChange,
			placeholder = '',
			styles = {},
			value = ''
		} = this.props;

		if (format.length != 0) {
			let blocks = format.map(d => parseInt(d.characterLength)),
				delimiters = format.map(d => d.delimiter);
			delimiters.pop();
			return (
				<Cleave
					autoComplete="off"
					class="ant-input"
					disabled={disabled}
					name={id}
					options={{ delimiters, blocks, numericOnly: true }}
					onBlur={e => {
						if (e.target.rawValue != value) onChange(id, e.target.rawValue);
						this.setState({ isFocused: false });
					}}
					onChange={e => this.onChange(e.target.rawValue)}
					onFocus={() => this.setState({ isFocused: true })}
					onKeyPress={e => {
						if (e.key === 'Enter') {
							onChange(id, e.target.rawValue);
							return true;
						}
					}}
					placeholder={placeholder || label || id}
					style={styles}
					value={localValue ? localValue : ''}
				/>
			);
		}

		return (
			<InputNumber
				allowClear
				autoComplete="off"
				disabled={disabled}
				name={id}
				onBlur={e => {
					const newValue = e.target.value.toString();
					if (newValue != value) onChange(id, localValue);
					this.setState({ isFocused: false });
				}}
				onChange={e => {
					if (localValue != '' && e.toString() == '') onChange(id, e.toString());
					this.onChange(e.toString());
				}}
				onFocus={() => this.setState({ isFocused: true })}
				onPressEnter={e => {
					onChange(id, e);
					return true;
				}}
				placeholder={placeholder || label || id}
				style={styles}
				value={localValue != '' ? localValue : ''}
			/>
		);
	}

	renderPopover = () => {
		const { isPopoverVisible } = this.state;
		const { id, label = '', historyTrackValue = '', onHistoryTrackChange } = this.props;

		return (
			<Popover
				content={
					<InputDate
						id={id}
						label={label}
						required={true}
						withTime={true}
						withLabel={true}
						value={historyTrackValue}
						onChange={onHistoryTrackChange}
					/>
				}
				trigger="click"
				title="History Track"
				visible={isPopoverVisible}
				onVisibleChange={this.handlePopoverVisible}>
				<span class="float-right">
					<Button
						type="link"
						shape="circle-outline"
						icon="warning"
						size="small"
						style={{ color: '#ffc107' }}
					/>
				</span>
			</Popover>
		);
	};

	render() {
		const { errors, hasChange } = this.state;
		const { action, label = '', required = false, withLabel = false, historyTrack = false } = this.props;

		const formItemCommonProps = {
			colon: false,
			help: errors.length != 0 ? errors[0] : '',
			label: withLabel ? label : false,
			required,
			validateStatus: errors.length != 0 ? 'error' : 'success'
		};

		return (
			<Form.Item {...formItemCommonProps}>
				{historyTrack && hasChange && action !== 'add' && this.renderPopover()}
				{this.renderInput()}
			</Form.Item>
		);
	}
}
