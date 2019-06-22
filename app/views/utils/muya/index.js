import Muya from './lib/index'
import TablePicker from './lib/ui/tablePicker/index'
import QuickInsert from './lib/ui/quickInsert/index'
import CodePicker from './lib/ui/codePicker/index'
import EmojiPicker from './lib/ui/emojiPicker/index'
import ImagePathPicker from './lib/ui/imagePicker/index'
import ImageSelector from './lib/ui/imageSelector/index'
import FormatPicker from './lib/ui/formatPicker/index'
import FrontMenu from './lib/ui/frontMenu/index'
import './themes/default.scss'

Muya.use(TablePicker)
Muya.use(QuickInsert)
Muya.use(CodePicker)
Muya.use(EmojiPicker)
Muya.use(ImagePathPicker)
Muya.use(ImageSelector)
Muya.use(FormatPicker)
Muya.use(FrontMenu)

export default Muya
