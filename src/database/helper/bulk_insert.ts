import {PoolClient} from "pg";

// 将 sql 中 insert 后的一个 ($1, $2, ...) 重复 times - 1 次。
export function sql_bulk_insert_convert(sql: string, times: number): string {
    const regex = /\((\$\d+(?:,\s*\$\d+)*)\)/; // 匹配括号内的($a, $b, $c, ...)
    const match = sql.match(regex);
    console.log(JSON.stringify(match))

    if (!match) {
        throw new Error("SQL statement does not contain a valid ($a, $b, $c, ...) structure.");
    }

    const variables = match[1].split(','); // 拆分括号中的变量
    const var_count_in_group = variables.length;

    if (var_count_in_group === 0) {
        throw new Error("No variables found inside the parentheses.");
    }

    const start_var_number = parseInt(variables[0].match(/\d+/)![0]); // 获取第一个变量的编号

    // 构造扩增部分
    let expanded_parts = ''
    for (let i = 0; i < times; i++) {
        expanded_parts += '('
        for (let j = 0; j < var_count_in_group; j++) {
            expanded_parts += `$${start_var_number + i * var_count_in_group + j}`
            if (j < var_count_in_group - 1) {
                expanded_parts += ', '
            }
        }
        expanded_parts += '), '
    }
    if (expanded_parts.length > 0) {
        expanded_parts = expanded_parts.slice(0, -2)
    }

    // 替换原始括号部分为扩增的结构
    return sql.replace(match[0], expanded_parts);
}

export async function bulk_insert_query(client: PoolClient, sql: string, data: any[][]) {
    // Get the number of columns from the first row of data
    const columnCount = data[0].length;
    // Flatten the data array
    const flattenedData = data.flat();
    // Execute the query with the flattened data array
    const converted_sql = sql_bulk_insert_convert(sql, data.length);
    console.log(converted_sql, data)
    return client.query(converted_sql, flattenedData);
}