import { h, Component } from 'preact';
import Configurator from '../../components/configurator';
import ConfigService from '../../lib/config';
import style from './style';

export default class Orders extends Component {
  constructor() {
    super();
    this.state.config = {};
    this.configService = ConfigService.shared();
    this.configService.on('updated', ({ config }) => {
      this.setState({ config });
    });
  }

  componentDidMount() {
    this.configService.init().then(config => {
      this.setState({ config });
    });
  }

  render() {
    return (
      <div class={style.admin}>
        <h3>Admin</h3>
        <Configurator
          config={this.state.config}
          update={(key, value) => this.updateConfig(key, value)}
        />
      </div>
    );
  }

  updateConfig(key, value) {
    this.configService.updateValue(key, value);
  }
}