import React, { Component } from 'react';
import { Input, Collapse, Button } from 'antd';
import styles from './index.less';
import { getPinYinCode, getWubiCode } from 'lancet-pywb/PY_WB';
import _pinyin from 'pinyin';

const { Panel } = Collapse;

export default class AliasItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.item?.name || '',
      pinyin: props.item?.pinyin || '',
      wubi: props.item?.wubi || '',
      shortPinyin: props.item?.shortPinyin || '',
    };
  }

  aliasChange = (e) => {
    const { index, onChange } = this.props;
    const item = JSON.parse(JSON.stringify(this.state));
    item.name = e.target.value;
    this.setState(item);
    onChange?.(index, item);
  };

  aliasBlur = (e) => {
    const { index, onChange } = this.props;
    const item = JSON.parse(JSON.stringify(this.state));
    if (!item.pinyin) {
      item.pinyin = _pinyin(e.target.value, {
        style: _pinyin.STYLE_NORMAL,
      }).join('');
    }
    if (!item.shortPinyin) {
      item.shortPinyin = getPinYinCode(e.target.value).toLowerCase();
    }
    if (!item.wubi) {
      item.wubi = getWubiCode(e.target.value).toLowerCase();
    }
    this.setState(item);
    onChange?.(index, item);
  };

  pinyinChange = (e) => {
    const { index, onChange } = this.props;
    const item = JSON.parse(JSON.stringify(this.state));
    item.pinyin = e.target.value;
    this.setState(item);
    onChange?.(index, item);
  };

  shortPinyinChange = (e) => {
    const { index, onChange } = this.props;
    const item = JSON.parse(JSON.stringify(this.state));
    item.shortPinyin = e.target.value;
    this.setState(item);
    onChange?.(index, item);
  };

  wubiChange = (e) => {
    const { index, onChange } = this.props;
    const item = JSON.parse(JSON.stringify(this.state));
    item.wubi = e.target.value;
    this.setState(item);
    onChange?.(index, item);
  };

  static getDerivedStateFromProps(props, state) {
    if (
      props.item?.name !== state.name ||
      props.item?.pinyin !== state.pinyin ||
      props.item?.wubi !== state.wubi
    ) {
      return {
        name: props.item?.name || '',
        pinyin: props.item?.pinyin || '',
        wubi: props.item?.wubi || '',
        shortPinyin: props.item?.shortPinyin || '',
      };
    }
    return {};
  }

  render() {
    const { name, pinyin, wubi, shortPinyin } = this.state;
    const { index, onDel } = this.props;
    return (
      <Collapse defaultActiveKey={['1']} style={{ marginBottom: '10px' }}>
        <Panel
          header="??????"
          key="1"
          extra={
            <Button danger size="small" onClick={() => onDel(index)}>
              ??????
            </Button>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '80px', textAlign: 'right' }}>?????????</div>
            <Input
              className={styles.aliasItemInput}
              placeholder="???????????????"
              value={name}
              onChange={this.aliasChange}
              onBlur={this.aliasBlur}
            ></Input>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ width: '80px', textAlign: 'right' }}>?????????</div>
            <Input
              className={styles.aliasItemInput}
              placeholder="???????????????"
              value={pinyin}
              onChange={this.pinyinChange}
            ></Input>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ width: '80px', textAlign: 'right' }}>????????????</div>
            <Input
              className={styles.aliasItemInput}
              placeholder="????????????????????????"
              value={shortPinyin}
              onChange={this.shortPinyinChange}
            ></Input>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ width: '80px', textAlign: 'right' }}>?????????</div>
            <Input
              className={styles.aliasItemInput}
              placeholder="???????????????"
              value={wubi}
              onChange={this.wubiChange}
            ></Input>
          </div>
        </Panel>
      </Collapse>
    );
  }
}
