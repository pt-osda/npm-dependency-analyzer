import getDependencies from '../lib/utils/dependencies'
import {catchifyPromise} from '../lib/utils/utility-functions'

test('check-dependencies-elements', async (done) => {
  expect.assertions(4)

  const [dependenciesError, {pkg, dependencies}] = await catchifyPromise(getDependencies([]))
  expect(dependenciesError).toBeNull()
  expect(pkg).toBeDefined()
  expect(dependencies).toBeDefined()

  function check (elem) {
    return elem.title !== undefined && elem.main_version !== undefined &&
      elem.private_versions !== undefined && elem.children !== undefined &&
      elem.vulnerabilities !== undefined
  }

  expect(dependencies.every(check)).toBeTruthy()

  done()
})
