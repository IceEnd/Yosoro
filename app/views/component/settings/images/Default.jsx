import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Radio, Icon } from 'antd';
import { withDispatch } from 'Components/HOC/context';
import { CHANGE_IMAGE_HOSTING } from 'Actions/app';
import formItemLayout from './layout';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const hosts = [{
  icon: 'github',
  label: 'GitHub',
  value: 'github',
}, {
  icon: 'weibo-circle',
  label: 'Weibo',
  value: 'weibo',
}];

@withDispatch
export default class DefaultHost extends PureComponent {
  static displayName = 'SettingsImagesHostingDefault';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    value: PropTypes.oneOf(['github', 'weibo']).isRequired,
  };

  onChange = (e) => {
    const value = e.target.value;
    this.props.dispatch({
      type: CHANGE_IMAGE_HOSTING,
      name: 'default',
      param: value,
    });
  }

  render() {
    const { value } = this.props;
    return (
      <Form>
        <FormItem
          key="repo"
          label="Default"
          {...formItemLayout}
          style={{ paddingBottom: 0, marginBottom: '1rem' }}
        >
          <RadioGroup
            value={value}
            onChange={this.onChange}
          >
            {hosts.map(item => (
              <Radio
                key={item.name}
                value={item.value}
              ><Icon type={item.icon} /> {item.label}</Radio>
            ))}
          </RadioGroup>
        </FormItem>
      </Form>
    );
  }
}
