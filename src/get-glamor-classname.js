import {css} from 'glamor'
/**
 * This function takes a className string and gets all the
 * associated glamor styles. It's used to merge glamor styles
 * from a className to make sure that specificity is not
 * a problem when passing a className to a component.
 * @param {String} [className=''] the className string
 * @return {Object} { glamorStyles, glamorlessClassName }
 *   - glamorStyles is an array of all the glamor styles objects
 *   - glamorlessClassName is the rest of the className string
 *     without the glamor classNames
 */
function extractGlamorStyles(className) {
  const glamorlessClassName = []
  const glamorStyles = []
  className.toString().split(' ').forEach(name => {
    if (name.indexOf('css-') === 0) {
      const style = buildGlamorSrcFromClassName(name)
      glamorStyles.push(style)
    } else {
      glamorlessClassName.push(name)
    }
  })

  return {glamorlessClassName, glamorStyles}
}

function buildGlamorSrcFromClassName(className) {
  return {[`data-${className}`]: ''}
}

export default getGlamorClassName

function getGlamorClassName({
  styles,
  props,
  cssOverrides,
  cssProp,
  theme,
  context,
}) {
  const {mappedArgs, nonGlamorClassNames} = handleStyles(
    [...styles, props.className, cssOverrides, cssProp],
    props,
    theme,
    context,
  )
  const glamorClassName = css(...mappedArgs).toString()
  const extras = nonGlamorClassNames.join(' ').trim()
  return `${glamorClassName} ${extras}`.trim()
}

// this next function is on a "hot" code-path
// so it's pretty complex to make sure it's fast.
// eslint-disable-next-line complexity
function handleStyles(styles, props, theme, context) {
  let current
  const mappedArgs = []
  const nonGlamorClassNames = []
  for (let i = 0; i < styles.length; i++) {
    current = styles[i]
    if (typeof current === 'function') {
      const result = current(props, theme, context)
      if (typeof result === 'string') {
        const {glamorStyles, glamorlessClassName} = extractGlamorStyles(
          result,
        )
        mappedArgs.push(...glamorStyles)
        nonGlamorClassNames.push(...glamorlessClassName)
      } else {
        mappedArgs.push(result)
      }
    } else if (typeof current === 'string') {
      const {glamorStyles, glamorlessClassName} = extractGlamorStyles(
        current,
      )
      mappedArgs.push(...glamorStyles)
      nonGlamorClassNames.push(...glamorlessClassName)
    } else if (Array.isArray(current)) {
      const recursed = handleStyles(current, props, theme, context)
      mappedArgs.push(...recursed.mappedArgs)
      nonGlamorClassNames.push(...recursed.nonGlamorClassNames)
    } else {
      mappedArgs.push(current)
    }
  }
  return {mappedArgs, nonGlamorClassNames}
}
